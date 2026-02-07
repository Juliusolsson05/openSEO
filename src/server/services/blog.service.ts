import { Prisma, TitleStatus } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import { NotFoundError, ValidationError } from '@/server/api/errors'
import { generateStructure } from '@/server/ai/blog-generation/generate-structure'
import { generateBlogPost } from '@/server/ai/blog-generation/generate-blog-post'
import * as blogRepository from '@/server/repositories/blog.repository'
import { toDbElementType } from '@/server/utils/element-type'
import type {
  CreateBlogPostInput,
  ListBlogPostsQueryInput,
  UpdateBlogPostInput,
} from '@/server/validators/blog.validators'

const DEFAULT_IMAGE = 'https://res.cloudinary.com/dl9qdd24e/image/upload/v1732560659/600x400_fqbihy.png'

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 8)
}

async function ensureUniqueSlug(baseSlug: string, excludeId?: number): Promise<string> {
  let candidate = baseSlug
  let existing = await blogRepository.findBySlug(candidate)

  while (existing && existing.id !== excludeId) {
    candidate = `${baseSlug}-${randomSuffix()}`
    existing = await blogRepository.findBySlug(candidate)
  }

  return candidate
}

export class BlogService {
  async listPosts(companyId: number, query: ListBlogPostsQueryInput) {
    const normalizedQuery = {
      ...query,
      categoryIds: query.categoryIds ?? (query.categoryId ? [query.categoryId] : undefined),
    }

    const [data, total] = await Promise.all([
      blogRepository.findMany(companyId, normalizedQuery),
      blogRepository.count(companyId, normalizedQuery),
    ])

    return { data, total }
  }

  async getPost(id: number, companyId: number) {
    const post = await blogRepository.findById(id, companyId)

    if (!post) {
      throw new NotFoundError('Blog post not found')
    }

    return post
  }

  async createPost(companyId: number, data: CreateBlogPostInput) {
    const baseSlug = slugify(data.titleText)
    const slug = await ensureUniqueSlug(baseSlug)

    const payload: Prisma.BlogPostCreateInput = {
      company: { connect: { id: companyId } },
      title_text: data.titleText,
      slug,
      seo_title: data.seoTitle,
      focus_keyword: data.focusKeyword,
      meta_description: data.metaDescription,
      excerpt: data.excerpt,
      ...(data.scheduledDate ? { scheduled_date: new Date(data.scheduledDate) } : {}),
      ...(data.coverImage ? { cover_image: data.coverImage as Prisma.InputJsonValue } : {}),
      ...(data.categoryIds
        ? {
            categories: {
              connect: data.categoryIds.map((categoryId) => ({ id: categoryId })),
            },
          }
        : {}),
    }

    return blogRepository.create(payload)
  }

  async updatePost(id: number, companyId: number, data: UpdateBlogPostInput) {
    const existing = await blogRepository.findById(id, companyId)

    if (!existing) {
      throw new NotFoundError('Blog post not found')
    }

    let nextSlug: string | undefined
    if (data.titleText && data.titleText !== existing.title_text) {
      const baseSlug = slugify(data.titleText)
      nextSlug = await ensureUniqueSlug(baseSlug, id)
    }

    const payload: Prisma.BlogPostUpdateInput = {
      ...(data.titleText !== undefined ? { title_text: data.titleText } : {}),
      ...(nextSlug ? { slug: nextSlug } : {}),
      ...(data.seoTitle !== undefined ? { seo_title: data.seoTitle } : {}),
      ...(data.focusKeyword !== undefined ? { focus_keyword: data.focusKeyword } : {}),
      ...(data.metaDescription !== undefined ? { meta_description: data.metaDescription } : {}),
      ...(data.excerpt !== undefined ? { excerpt: data.excerpt } : {}),
      ...(data.coverImage !== undefined
        ? { cover_image: data.coverImage as Prisma.InputJsonValue }
        : {}),
      ...(data.scheduledDate !== undefined
        ? {
            scheduled_date: data.scheduledDate ? new Date(data.scheduledDate) : null,
          }
        : {}),
      ...(data.reviewed !== undefined ? { reviewed: data.reviewed } : {}),
      ...(data.keywordSynced !== undefined ? { keyword_synced: data.keywordSynced } : {}),
      ...(data.keywordLinked !== undefined ? { keyword_linked: data.keywordLinked } : {}),
      ...(data.postsSynced !== undefined ? { posts_synced: data.postsSynced } : {}),
      ...(data.imageGeneration !== undefined ? { image_generation: data.imageGeneration } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.operation !== undefined ? { operation: data.operation } : {}),
      ...(data.generatedDate !== undefined
        ? {
            generated_date: data.generatedDate ? new Date(data.generatedDate) : null,
          }
        : {}),
      ...(data.categoryIds !== undefined
        ? {
            categories: {
              set: data.categoryIds.map((categoryId) => ({ id: categoryId })),
            },
          }
        : {}),
    }

    return blogRepository.update(id, payload)
  }

  async deletePost(id: number, companyId: number) {
    const existing = await blogRepository.findById(id, companyId)

    if (!existing) {
      throw new NotFoundError('Blog post not found')
    }

    await blogRepository.deletePost(id, companyId)
  }

  async listFocusKeywords(companyId: number) {
    return blogRepository.listFocusKeywords(companyId)
  }

  async generatePostFromTitle(companyId: number, titleId?: number | null) {
    const company = await prisma.company.findUnique({ where: { id: companyId } })
    if (!company) throw new NotFoundError('Company not found')

    const title = await prisma.title.findFirst({
      where: {
        companyId,
        status: TitleStatus.TO_BE_GENERATED,
        ...(titleId ? { id: titleId } : {}),
      },
      orderBy: { id: 'asc' },
      include: { categories: { select: { id: true } } },
    })

    if (!title) throw new NotFoundError(titleId ? 'Title not found or already generated' : 'No more titles to generate')

    const settings = (company.settings ?? {}) as Record<string, any>
    const blogSettings = settings['aurora.blog'] ?? {}
    const allowedElements = blogSettings.initial_generation_elements
    const structureModel = blogSettings.blog_post_structure_model ?? 'gpt-4o'
    const contentModel = blogSettings.blog_post_content_model ?? 'gpt-4o-mini'

    const businessDescription = (company.metadata as any)?.business_description ?? ''
    const businessName = company.name
    const businessAware = Boolean(businessDescription && businessName)

    const { structure } = await generateStructure(title.title_text, structureModel, allowedElements)
    const { elements } = await generateBlogPost(
      title.seo_title ?? title.title_text,
      title.focus_keyword ?? '',
      title.title_text,
      structure,
      contentModel,
      businessAware,
      businessDescription,
      businessName,
    )

    let metaDescription: string | null = null
    let excerpt: string | null = null
    let coverImage: Record<string, unknown> | null = null
    const filtered: Array<{ type: string; content: Record<string, unknown> }> = []

    for (const element of elements) {
      const type = String(element.type ?? '')
      const content = (element.content ?? {}) as Record<string, unknown>
      if (type === 'meta_description') metaDescription = (content.text as string) ?? null
      else if (type === 'excerpt') excerpt = (content.text as string) ?? null
      else if (type === 'cover_image') coverImage = { ...content, url: DEFAULT_IMAGE }
      else filtered.push({ type, content })
    }

    await prisma.$transaction(async (tx) => {
      const baseSlug = slugify(title.title_text)
      const slug = await ensureUniqueSlug(baseSlug)

      const post = await tx.blogPost.create({
        data: {
          companyId,
          title_text: title.title_text,
          slug,
          seo_title: title.seo_title,
          focus_keyword: title.focus_keyword,
          status: TitleStatus.GENERATED,
          scheduled_date: title.scheduled_date,
          bulkScheduleId: title.bulkScheduleId,
          generated_date: new Date(),
          created_at: title.created_at,
          meta_description: metaDescription,
          excerpt,
          cover_image: (coverImage ?? { url: DEFAULT_IMAGE, description: '' }) as Prisma.InputJsonValue,
          categories: { connect: title.categories.map((c) => ({ id: c.id })) },
        },
      })

      for (let index = 0; index < filtered.length; index += 1) {
        const dbType = toDbElementType(filtered[index].type)
        if (!dbType) continue
        const content = filtered[index].type === 'image'
          ? { ...filtered[index].content, url: DEFAULT_IMAGE }
          : filtered[index].content

        await tx.blogPostElement.create({
          data: {
            blogPostId: post.id,
            element_type: dbType,
            content: content as Prisma.InputJsonValue,
            order: index,
          },
        })
      }

      await tx.title.update({
        where: { id: title.id },
        data: { status: TitleStatus.GENERATED, generated_date: new Date(), blogPostId: post.id },
      })
    })

    const nextTitle = await prisma.title.findFirst({
      where: { companyId, status: TitleStatus.TO_BE_GENERATED },
      orderBy: { id: 'asc' },
      select: { id: true },
    })

    const [remaining, total, generated] = await Promise.all([
      prisma.title.count({ where: { companyId, status: TitleStatus.TO_BE_GENERATED } }),
      prisma.title.count({ where: { companyId } }),
      prisma.title.count({ where: { companyId, status: TitleStatus.GENERATED } }),
    ])

    return {
      status: `Generated post for title: ${title.title_text}`,
      next_post_id: nextTitle?.id ?? null,
      remaining_posts_count: remaining,
      total_posts_count: total,
      generated_posts_count: generated,
    }
  }

  async regeneratePost(_companyId: number, _postId: number) {
    throw new ValidationError('Not implemented yet')
  }

  async sharePost(_companyId: number, _postId: number) {
    throw new Error('TODO: implement sharePost')
  }

  async syncPost(_companyId: number, _postId: number) {
    throw new Error('TODO: implement syncPost')
  }

  async exportPost(_companyId: number, _postId: number) {
    throw new Error('TODO: implement exportPost')
  }

  async listPostHistory(_companyId: number, _postId: number) {
    throw new Error('TODO: implement listPostHistory')
  }
}

export const blogService = new BlogService()
