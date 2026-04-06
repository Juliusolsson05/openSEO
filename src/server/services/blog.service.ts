import { Prisma, TitleStatus } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import { MODELS } from '@/server/ai/clients'
import { NotFoundError, ValidationError } from '@/server/api/errors'
import { generateStructure } from '@/server/ai/blog-generation/generate-structure'
import { generateBlogPost } from '@/server/ai/blog-generation/generate-blog-post'
import { generateRecommendedPosts } from '@/server/ai/post-linking/generate-recommended-posts'
import { processHyperlinks } from '@/server/ai/keyword-linking/process-hyperlinks'
import { ELEMENT_PROCESSING_MAP } from '@/server/ai/keyword-matching/find-matched-keywords'
import * as blogRepository from '@/server/repositories/blog.repository'
import { assertCategoryOwnership } from '@/server/services/_helpers/assert-category-ownership'
import { toDbElementType } from '@/server/utils/element-type'
import { generateShareToken } from '@/server/lib/share-token'
import { sendJsonWebhook } from '@/server/services/webhook-delivery.service'
import type {
  CreateBlogPostInput,
  ListBlogPostsQueryInput,
  UpdateBlogPostInput,
} from '@/server/validators/blog.validators'
import { DEFAULT_GENERATION_ELEMENTS } from '@/lib/constants/generation'

const DEFAULT_IMAGE = '/images/placeholder-cover.svg'

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

async function ensureUniqueSlug(
  companyId: number,
  baseSlug: string,
  excludeId?: number,
): Promise<string> {
  let candidate = baseSlug
  let existing = await blogRepository.findBySlug(companyId, candidate)

  while (existing && existing.id !== excludeId) {
    candidate = `${baseSlug}-${randomSuffix()}`
    existing = await blogRepository.findBySlug(companyId, candidate)
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
    await assertCategoryOwnership(prisma, companyId, data.categoryIds)
    const baseSlug = slugify(data.titleText)
    const slug = await ensureUniqueSlug(companyId, baseSlug)

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

    if (data.categoryIds !== undefined) {
      await assertCategoryOwnership(prisma, companyId, data.categoryIds)
    }

    let nextSlug: string | undefined
    if (data.titleText && data.titleText !== existing.title_text) {
      const baseSlug = slugify(data.titleText)
      nextSlug = await ensureUniqueSlug(companyId, baseSlug, id)
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
    const allowedElements = blogSettings.initial_generation_elements ?? DEFAULT_GENERATION_ELEMENTS
    const structureModel = blogSettings.blog_post_structure_model ?? MODELS.OPENAI_SMART
    const contentModel = blogSettings.blog_post_content_model ?? MODELS.OPENAI_DEFAULT

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
      // categories flow through from an already-verified title row, so they
      // are trusted here — no assertCategoryOwnership call needed.
      const slug = await ensureUniqueSlug(companyId, baseSlug)

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

  async regeneratePost(companyId: number, postId: number) {
    if (!postId) throw new ValidationError('post_id is required.')

    const blogPost = await prisma.blogPost.findFirst({
      where: { id: postId, companyId, status: TitleStatus.GENERATED },
      include: { categories: { select: { id: true } } },
    })

    if (!blogPost) {
      throw new NotFoundError('BlogPost not found or not in a regenerable state.')
    }

    // Step 1: load generation settings. No DB writes yet — the existing post
    // and its elements remain intact so a failure here leaves the post
    // exactly as it was.
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { settings: true },
    })
    const settings = (company?.settings ?? {}) as Record<string, any>
    const blogSettings = settings['aurora.blog'] ?? {}
    const structureModel = blogSettings.blog_post_structure_model ?? MODELS.OPENAI_SMART
    const contentModel = blogSettings.blog_post_content_model ?? MODELS.OPENAI_DEFAULT
    const allowedElements = blogSettings.initial_generation_elements ?? DEFAULT_GENERATION_ELEMENTS

    // Step 2: generate the new content into in-memory staging. If either AI
    // call throws, we never touched the database and the caller will see the
    // error with the post untouched.
    const { structure } = await generateStructure(blogPost.title_text, structureModel, allowedElements)
    const { elements } = await generateBlogPost(
      blogPost.seo_title ?? blogPost.title_text,
      blogPost.focus_keyword ?? '',
      blogPost.title_text,
      structure,
      contentModel,
      false,
    )

    // Step 3: normalize generated elements into staging variables.
    let metaDescription: string | null = null
    let excerpt: string | null = null
    let coverImage: Record<string, unknown> | null = null
    const stagedElements: Array<{ type: string; content: Record<string, unknown> }> = []

    for (const element of elements) {
      const type = String(element.type ?? '')
      const content = (element.content ?? {}) as Record<string, unknown>
      if (type === 'meta_description') metaDescription = (content.text as string) ?? null
      else if (type === 'excerpt') excerpt = (content.text as string) ?? null
      else if (type === 'cover_image') coverImage = { ...content, url: DEFAULT_IMAGE }
      else stagedElements.push({ type, content })
    }

    // Step 4: atomic swap. Delete old elements + publish mappings and create
    // the new elements + update the post inside a single transaction. If any
    // step throws, Prisma rolls the whole transaction back and the original
    // post survives. BlogPublish mappings are removed because the remote post
    // binding is stale after regeneration.
    await prisma.$transaction(async (tx) => {
      await tx.blogPostElement.deleteMany({ where: { blogPostId: blogPost.id } })
      await tx.blogPublish.deleteMany({ where: { blogPostId: blogPost.id } })

      for (let index = 0; index < stagedElements.length; index += 1) {
        const dbType = toDbElementType(stagedElements[index].type)
        if (!dbType) continue
        const content = stagedElements[index].type === 'image'
          ? { ...stagedElements[index].content, url: DEFAULT_IMAGE }
          : stagedElements[index].content

        await tx.blogPostElement.create({
          data: {
            blogPostId: blogPost.id,
            element_type: dbType,
            content: content as Prisma.InputJsonValue,
            order: index,
          },
        })
      }

      await tx.blogPost.update({
        where: { id: blogPost.id },
        data: {
          status: TitleStatus.GENERATED,
          generated_date: new Date(),
          cover_image: (coverImage ?? { url: DEFAULT_IMAGE, description: '' }) as Prisma.InputJsonValue,
          meta_description: metaDescription,
          excerpt,
          image_generation: false,
          keyword_synced: false,
          keyword_linked: false,
          posts_synced: false,
          reviewed: false,
        },
      })
    })

    const nextTitle = await prisma.title.findFirst({
      where: { companyId, status: TitleStatus.TO_BE_GENERATED },
      orderBy: { id: 'asc' },
      select: { id: true },
    })

    return {
      status: `Regenerated post for title: ${blogPost.title_text}`,
      next_post_id: nextTitle?.id ?? null,
    }
  }

  async sharePost(companyId: number, postId: number, createdByUserId: string | null) {
    const post = await prisma.blogPost.findFirst({
      where: { id: postId, companyId },
      select: { id: true },
    })
    if (!post) throw new NotFoundError('Blog post not found or does not belong to your company')

    const frontendBaseUrl = process.env.FRONTEND_URL ?? 'http://localhost:4720'
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    const token = generateShareToken()

    // Upsert: one share link per post (matches @@unique([postId])).
    // When a new link is minted, clear any prior revocation.
    const link = await prisma.shareLink.upsert({
      where: { postId },
      update: {
        token,
        enabled: true,
        expiresAt,
        revokedAt: null,
        createdByUserId,
        companyId,
      },
      create: {
        postId,
        companyId,
        createdByUserId,
        token,
        enabled: true,
        expiresAt,
      },
    })

    return {
      share_url: `${frontendBaseUrl}/share/blog/${link.token}`,
      share_token: link.token,
      expires_at: link.expiresAt!.toISOString(),
    }
  }

  async syncRecommendedPosts(companyId: number) {
    // Only consider posts that have actual content — titles still waiting on
    // generation (TO_BE_GENERATED, APPROVED, REJECTED) must not appear as
    // related-post targets. Both GENERATED and PUBLISHED count as "has content".
    const publishableStatuses = ['GENERATED', 'PUBLISHED'] as const
    const posts = await prisma.blogPost.findMany({
      where: { companyId, status: { in: [...publishableStatuses] } },
      select: { id: true, title_text: true },
      orderBy: { id: 'asc' },
    })

    if (!posts.length) return []

    const generatedIds = new Set(posts.map((p) => p.id))

    const recommendations = await generateRecommendedPosts(
      posts.map((p) => ({ id: p.id, title: p.title_text })),
    )
    if (typeof recommendations === 'string') throw new ValidationError(recommendations)

    await prisma.$transaction(async (tx) => {
      for (const row of recommendations) {
        // Only link to IDs that are actually generated/published (the AI may
        // hallucinate IDs or return stale ones)
        const targetIds = (row.recommended_posts ?? [])
          .filter((id) => id !== row.id && generatedIds.has(id))
          .slice(0, 3)
        await tx.blogPostPostLink.deleteMany({ where: { fromBlogPostId: row.id } })
        if (targetIds.length) {
          await tx.blogPostPostLink.createMany({
            data: targetIds.map((toId) => ({ fromBlogPostId: row.id, toBlogPostId: toId })),
            skipDuplicates: true,
          })
        }
      }
    })

    return recommendations
  }

  async syncKeywords(companyId: number, dictionaryId: number, postId?: number) {
    const dictionary = await prisma.dictionary.findFirst({ where: { id: dictionaryId, companyId } })
    if (!dictionary) throw new NotFoundError('Dictionary not found')

    const post = postId
      ? await prisma.blogPost.findFirst({ where: { id: postId, companyId } })
      : await prisma.blogPost.findFirst({ where: { companyId, keyword_linked: false }, orderBy: { id: 'asc' } })

    if (!post) {
      const total = await prisma.blogPost.count({ where: { companyId } })
      const linked = await prisma.blogPost.count({ where: { companyId, keyword_linked: true } })
      return {
        status: 'No more blog posts to link keywords.',
        elements: [],
        next_post_id: null,
        remaining_posts_count: 0,
        total_posts_count: total,
        linked_posts_count: linked,
      }
    }

    const elements = await prisma.blogPostElement.findMany({
      where: { blogPostId: post.id },
      orderBy: { order: 'asc' },
      include: { hyperlink: true },
    })
    const words = await prisma.word.findMany({ where: { dictionaryId }, select: { keyword: true, description: true } })

    const serialized: any[] = []
    for (const element of elements) {
      if (element.element_type === 'IMAGE') continue
      const processor = (ELEMENT_PROCESSING_MAP as any)[element.element_type.toLowerCase()]
      if (!processor) continue

      const matchedKeywords = processor(element.content as Record<string, unknown>, words)
      const processed = await processHyperlinks({
        id: element.id,
        element_type: element.element_type.toLowerCase(),
        order: element.order,
        content: element.content,
        hyperlink: { matched_keywords: matchedKeywords },
      })

      const processedKeywords = (processed as any)?.hyperlink?.matched_keywords ?? matchedKeywords
      await prisma.elementHyperlink.upsert({
        where: { blogPostElementId: element.id },
        update: { matched_keywords: processedKeywords as Prisma.InputJsonValue },
        create: {
          blogPostElementId: element.id,
          matched_keywords: processedKeywords as Prisma.InputJsonValue,
        },
      })

      serialized.push({
        id: element.id,
        element_type: element.element_type.toLowerCase(),
        order: element.order,
        content: element.content,
        created_at: element.created_at,
        blog_post: element.blogPostId,
        matched_keywords: processedKeywords,
      })
    }

    await prisma.blogPost.update({ where: { id: post.id }, data: { keyword_linked: true } })

    const nextPost = await prisma.blogPost.findFirst({ where: { companyId, keyword_linked: false }, orderBy: { id: 'asc' } })
    const [remaining, total, linked] = await Promise.all([
      prisma.blogPost.count({ where: { companyId, keyword_linked: false } }),
      prisma.blogPost.count({ where: { companyId } }),
      prisma.blogPost.count({ where: { companyId, keyword_linked: true } }),
    ])

    return {
      status: `Linked keywords for blog post: ${post.title_text}`,
      elements: serialized,
      next_post_id: nextPost?.id ?? null,
      remaining_posts_count: remaining,
      total_posts_count: total,
      linked_posts_count: linked,
    }
  }

  async uploadPost(companyId: number, postId: number, dictionaryId: number, exportMethod: string) {
    if (!['elementor', 'json_webhook', 'json'].includes(exportMethod)) {
      throw new ValidationError('Supported export methods: elementor, json_webhook, json')
    }
    if (!dictionaryId) throw new NotFoundError('Dictionary not found')

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { api_endpoint: true, api_key: true },
    })

    if (!company?.api_endpoint) {
      throw new ValidationError('Publishing endpoint is not configured. Set it in Settings/API Configuration.')
    }

    const payload = await this.exportPost(companyId, postId, dictionaryId)
    const post = await this.getPost(postId, companyId)

    const delivery = await sendJsonWebhook({
      endpoint: company.api_endpoint,
      apiKey: company.api_key,
      eventType: 'post.upsert',
      payload,
    })

    if (!delivery.ok) {
      throw new ValidationError(`Publishing endpoint returned HTTP ${delivery.status}`)
    }

    const remoteId = delivery.deliveryId
    const existingPublish = await prisma.blogPublish.findFirst({ where: { blogPostId: postId } })
    if (existingPublish) {
      await prisma.blogPublish.update({ where: { id: existingPublish.id }, data: { remote_id: remoteId } })
    } else {
      await prisma.blogPublish.create({ data: { blogPostId: postId, remote_id: remoteId } })
    }

    return {
      status: `Successfully delivered post payload for title: ${post.title_text}`,
      delivery: {
        remote_id: remoteId,
        endpoint_status: delivery.status,
        endpoint_response: delivery.response,
      },
    }
  }

  async uploadAllPosts(companyId: number, dictionaryId: number, exportMethod: string) {
    if (!['elementor', 'json_webhook', 'json'].includes(exportMethod)) {
      throw new ValidationError('Supported export methods: elementor, json_webhook, json')
    }
    if (!dictionaryId) throw new NotFoundError('Dictionary not found')

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { api_endpoint: true, api_key: true },
    })

    if (!company?.api_endpoint) {
      throw new ValidationError('Publishing endpoint is not configured. Set it in Settings/API Configuration.')
    }

    const posts = await prisma.blogPost.findMany({ where: { companyId, status: 'GENERATED' }, select: { id: true, title_text: true } })
    const uploaded = [] as Array<{ post_id: number; remote_id: string; endpoint_status: number }>

    for (const post of posts) {
      const payload = await this.exportPost(companyId, post.id, dictionaryId)
      const delivery = await sendJsonWebhook({
        endpoint: company.api_endpoint,
        apiKey: company.api_key,
        eventType: 'post.upsert',
        payload,
      })

      if (!delivery.ok) {
        throw new ValidationError(`Publishing endpoint returned HTTP ${delivery.status} while uploading post ${post.id}`)
      }

      const remoteId = delivery.deliveryId
      const existingPublish = await prisma.blogPublish.findFirst({ where: { blogPostId: post.id } })
      if (existingPublish) {
        await prisma.blogPublish.update({ where: { id: existingPublish.id }, data: { remote_id: remoteId } })
      } else {
        await prisma.blogPublish.create({ data: { blogPostId: post.id, remote_id: remoteId } })
      }

      uploaded.push({ post_id: post.id, remote_id: remoteId, endpoint_status: delivery.status })
    }

    return { status: 'Upload completed', uploaded }
  }

  async exportPost(companyId: number, postId: number, dictionaryId: number) {
    if (!dictionaryId) throw new NotFoundError('Not found.')

    const post = await this.getPost(postId, companyId)
    const categories = (post.categories ?? []).map((c: any) => c.name)
    return {
      post: {
        id: post.id,
        title_text: post.title_text,
        slug: post.slug,
        seo_title: post.seo_title,
        focus_keyword: post.focus_keyword,
        excerpt: post.excerpt,
        meta_description: post.meta_description,
        cover_image: post.cover_image,
        last_updated: post.last_updated,
        categories,
      },
      processed_content: post,
      raw_content: post,
    }
  }

  async exportAllPosts(companyId: number, dictionaryId: number) {
    if (!dictionaryId) throw new NotFoundError('Not found.')

    const posts = await prisma.blogPost.findMany({
      where: { companyId, status: 'GENERATED' },
      include: { categories: { select: { name: true } }, elements: { orderBy: { order: 'asc' } } },
      orderBy: { id: 'asc' },
    })

    const exportedPosts = posts.map((post) => ({
      post: {
        id: post.id,
        title_text: post.title_text,
        slug: post.slug,
        seo_title: post.seo_title,
        focus_keyword: post.focus_keyword,
        excerpt: post.excerpt,
        meta_description: post.meta_description,
        cover_image: post.cover_image,
        last_updated: post.last_updated,
        categories: post.categories.map((c) => c.name),
      },
      processed_content: post,
      raw_content: post,
    }))

    return { status: 'Export completed', exported_posts: exportedPosts, errors: [] }
  }

  async exportThirdParty(companyId: number, postId: number, endpointUrl: string) {
    if (!endpointUrl) throw new ValidationError('endpoint_url is required')

    const post = await prisma.blogPost.findFirst({ where: { id: postId, companyId, status: 'GENERATED' }, select: { id: true } })
    if (!post) throw new NotFoundError('Not found.')

    const payload = await this.getPost(post.id, companyId)
    const delivery = await sendJsonWebhook({
      endpoint: endpointUrl,
      eventType: 'post.upsert',
      payload,
    })

    if (!delivery.ok) {
      throw new ValidationError(`Endpoint responded with HTTP ${delivery.status}`)
    }

    await prisma.blogPublish.create({ data: { blogPostId: post.id, remote_id: delivery.deliveryId } })
    return { status: 'success', message: 'Successfully exported 1 blog post', delivery }
  }

  async exportThirdPartyAll(companyId: number, endpointUrl: string) {
    if (!endpointUrl) throw new ValidationError('endpoint_url is required')

    const posts = await prisma.blogPost.findMany({ where: { companyId, status: 'GENERATED' }, select: { id: true } })

    for (const post of posts) {
      const payload = await this.getPost(post.id, companyId)
      const delivery = await sendJsonWebhook({
        endpoint: endpointUrl,
        eventType: 'post.upsert',
        payload,
      })

      if (!delivery.ok) {
        throw new ValidationError(`Endpoint responded with HTTP ${delivery.status} while exporting post ${post.id}`)
      }

      await prisma.blogPublish.create({ data: { blogPostId: post.id, remote_id: delivery.deliveryId } })
    }

    return { status: 'success', message: `Successfully exported ${posts.length} blog posts` }
  }

  async getCodeClusterBlogPosts(companyId: number) {
    const rows = await prisma.blogPost.findMany({
      where: {
        companyId,
        elements: { some: { element_type: 'code_cluster' } },
      },
      distinct: ['id'],
      select: { title_text: true },
      orderBy: { id: 'asc' },
    })
    return rows.map((r) => r.title_text)
  }

  async listPostHistory(companyId: number, postId: number) {
    const post = await prisma.blogPost.findFirst({
      where: { id: postId, companyId },
      include: { elements: { orderBy: { order: 'asc' } } },
    })
    if (!post) throw new NotFoundError('Blog post not found')

    return {
      post_id: post.id,
      title: post.title_text,
      total_versions: 1,
      history: [
        {
          history_id: post.id,
          history_date: post.last_updated,
          history_type: '~',
          history_user: null,
          title_text: post.title_text,
          seo_title: post.seo_title,
          focus_keyword: post.focus_keyword,
          meta_description: post.meta_description,
          excerpt: post.excerpt,
          cover_image: post.cover_image,
          image_generation: post.image_generation,
          keyword_synced: post.keyword_synced,
          keyword_linked: post.keyword_linked,
          posts_synced: post.posts_synced,
          reviewed: post.reviewed,
          last_updated: post.last_updated,
          elements: post.elements.map((e) => ({
            element_type: e.element_type.toLowerCase(),
            order: e.order,
            content: e.content,
            history_date: e.created_at,
          })),
        },
      ],
    }
  }

  async getPostHistoryRevision(companyId: number, postId: number, historyId: number) {
    const history = await this.listPostHistory(companyId, postId)
    const record = (history.history as any[]).find((h) => Number(h.history_id) === Number(historyId))
    if (!record) throw new NotFoundError('Historical version not found')
    return record
  }
}

export const blogService = new BlogService()
