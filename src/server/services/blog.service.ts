import { Prisma } from '@prisma/client'

import { NotFoundError } from '@/server/api/errors'
import * as blogRepository from '@/server/repositories/blog.repository'
import type {
  CreateBlogPostInput,
  ListBlogPostsQueryInput,
  UpdateBlogPostInput,
} from '@/server/validators/blog.validators'

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
    const [data, total] = await Promise.all([
      blogRepository.findMany(companyId, query),
      blogRepository.count(companyId, query),
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

  // TODO: Generation endpoints
  async generatePostFromTitle(_companyId: number, _titleId: number) {
    throw new Error('TODO: implement generatePostFromTitle')
  }

  async regeneratePost(_companyId: number, _postId: number) {
    throw new Error('TODO: implement regeneratePost')
  }

  // TODO: Share/sync/export/history endpoints
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
