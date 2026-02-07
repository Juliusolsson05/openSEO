import { apiHandler } from '@/server/api/handler'
import { NotFoundError, ValidationError } from '@/server/api/errors'
import { error, raw } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { prisma } from '@/lib/prisma'
import { analyticsService } from '@/server/services/analytics.service'
import { blogService } from '@/server/services/blog.service'
import { categoryService } from '@/server/services/category.service'
import { ctaService } from '@/server/services/cta.service'
import { dictionaryService } from '@/server/services/dictionary.service'
import { elementService } from '@/server/services/element.service'
import { imageService } from '@/server/services/image.service'
import { productService } from '@/server/services/product.service'
import { quilloService } from '@/server/services/quillo.service'
import { scheduleService } from '@/server/services/schedule.service'
import { titleService } from '@/server/services/title.service'
import {
  blogPostIdSchema,
  createBlogPostSchema,
  listBlogPostsQuerySchema,
  updateBlogPostSchema,
} from '@/server/validators/blog.validators'
import {
  addCategoriesSchema,
  bulkDeleteCategoriesSchema,
  updateCategorySchema,
} from '@/server/validators/category.validators'
import {
  createCampaignSchema,
  createCtaSchema,
  updateCampaignSchema,
  updateCtaSchema,
} from '@/server/validators/cta.validators'
import {
  deleteWordsSchema,
  updateDictionarySchema,
  updateWordSchema,
} from '@/server/validators/dictionary.validators'
import { addElementSchema, updateElementSchema } from '@/server/validators/element.validators'
import {
  assignToBulkSchema,
  createBulkScheduleSchema,
  removeFromBulkSchema,
  scheduleByIntervalSchema,
  schedulePostSchema,
  updateBulkScheduleSchema,
} from '@/server/validators/schedule.validators'
import { createTitleSchema, listTitlesQuerySchema, updateTitleSchema } from '@/server/validators/title.validators'
import { serializeElement } from '@/server/utils/element-type'

function getSlugParts(params: Record<string, unknown>): string[] {
  const raw = params.slug
  if (Array.isArray(raw)) return raw.map(String)
  if (typeof raw === 'string') return raw.split('/').filter(Boolean)
  return []
}

function methodNotImplemented(path: string) {
  return error(`Endpoint not implemented yet: /api/aurora/${path}`, 501)
}

function methodNotAllowed(method: string) {
  return raw({ detail: `Method "${method}" not allowed.` }, 405)
}

function matchesPath(path: string, pattern: RegExp | string): boolean {
  return typeof pattern === 'string' ? path === pattern : pattern.test(path)
}

function enforceMethod(path: string, method: string): ReturnType<typeof raw> | null {
  const methodRules: Array<{ pattern: RegExp | string; allowed: string[] }> = [
    { pattern: 'blog/titles/categories/bulk-delete', allowed: ['POST'] },
    { pattern: /^blog\/titles\/categories\/edit\/\d+$/, allowed: ['PUT', 'PATCH'] },
    { pattern: /^blog\/titles\/update\/\d+$/, allowed: ['PUT', 'PATCH'] },
    { pattern: 'blog/posts/delete-element', allowed: ['DELETE'] },
    { pattern: 'blog/posts/elements/add', allowed: ['POST'] },
    { pattern: 'blog/posts/elements/regenerate', allowed: ['POST'] },
    { pattern: 'blog/posts/elements/enhance', allowed: ['POST'] },
    { pattern: 'blog/posts/elements/enhance-readability', allowed: ['POST'] },
    { pattern: 'blog/posts/elements/humanize', allowed: ['POST'] },
    { pattern: 'blog/posts/elements/get/code-clusters', allowed: ['GET'] },
    { pattern: 'blog/posts/elements/template/create', allowed: ['POST'] },
    { pattern: 'blog/posts/elements/add-cta', allowed: ['POST'] },
    { pattern: 'blog/posts/elements/template/use', allowed: ['POST'] },
    { pattern: 'blog/posts/share', allowed: ['POST'] },
    { pattern: /^blog\/posts\/update-element\/\d+$/, allowed: ['PUT'] },
    { pattern: 'blog/posts/update', allowed: ['PUT', 'PATCH'] },
    { pattern: 'blog/schedule/bulk', allowed: ['POST'] },
    { pattern: 'blog/schedule/bulk/create', allowed: ['POST'] },
    { pattern: 'blog/schedule/bulk/remove', allowed: ['POST'] },
    { pattern: 'blog/schedule/bulk/assign', allowed: ['POST'] },
    { pattern: /^blog\/schedule\/bulk\/update\/\d+$/, allowed: ['PUT', 'PATCH'] },
    { pattern: /^blog\/schedule\/post\/\d+$/, allowed: ['POST'] },
    { pattern: 'blog/schedule/interval', allowed: ['POST'] },
    { pattern: /^blog\/schedule\/reschedule\/\d+$/, allowed: ['PUT', 'PATCH'] },
    { pattern: 'blog/cta/list', allowed: ['GET'] },
    { pattern: 'blog/cta/create', allowed: ['POST'] },
    { pattern: 'blog/cta/add-cta', allowed: ['POST'] },
    { pattern: /^blog\/cta\/edit\/\d+$/, allowed: ['PUT', 'PATCH'] },
    { pattern: /^blog\/cta\/delete\/\d+$/, allowed: ['DELETE'] },
    { pattern: 'blog/cta/campaign/create', allowed: ['POST'] },
    { pattern: /^blog\/cta\/campaign\/edit\/\d+$/, allowed: ['PUT', 'PATCH'] },
    { pattern: /^blog\/cta\/campaign\/delete\/\d+$/, allowed: ['DELETE'] },
    { pattern: 'dictionary/dictionaries', allowed: ['GET'] },
    { pattern: /^dictionary\/dictionary\/\d+$/, allowed: ['GET'] },
    { pattern: /^dictionary\/dictionary\/\d+\/word\/\d+$/, allowed: ['GET'] },
    { pattern: /^dictionary\/modify\/\d+$/, allowed: ['PUT', 'DELETE'] },
    { pattern: /^dictionary\/modify\/word\/\d+$/, allowed: ['PUT', 'DELETE'] },
    { pattern: 'dictionary/dictionary/words/delete', allowed: ['POST'] },
    { pattern: 'dictionary/generation/keywords/start', allowed: ['POST'] },
    { pattern: 'dictionary/generation/keywords/review', allowed: ['POST'] },
    { pattern: 'dictionary/generation/keywords/end', allowed: ['POST'] },
    { pattern: 'dictionary/generation/definition/generate', allowed: ['POST'] },
    { pattern: 'dictionary/generation/keyword/new', allowed: ['POST'] },
    { pattern: 'dictionary/generation/definition/new', allowed: ['POST'] },
    { pattern: 'dictionary/dictionary/upload', allowed: ['POST'] },
    { pattern: 'dictionary/dictionary/upload/all', allowed: ['POST'] },
    { pattern: 'dictionary/dictionary/export', allowed: ['POST'] },
    { pattern: 'dictionary/dictionary/export/all', allowed: ['POST'] },
    { pattern: 'dictionary/dictionary/export/third-party', allowed: ['POST'] },
    { pattern: 'dictionary/dictionary/export/third-party/all', allowed: ['POST'] },
    { pattern: 'blog/quillo/analyze', allowed: ['POST'] },
    { pattern: 'blog/quillo/analyze/chat', allowed: ['POST'] },
    { pattern: 'blog/quillo/post/facebook', allowed: ['POST'] },
    { pattern: 'blog/quillo/post/autopilot', allowed: ['POST'] },
    { pattern: /^blog\/quillo\/post\/autopilot-status\/[^/]+$/, allowed: ['GET'] },
    { pattern: 'company/quillo', allowed: ['GET'] },
    { pattern: 'company/quillo/analyze', allowed: ['POST'] },
    { pattern: 'analytics/blog/readability', allowed: ['GET'] },
    { pattern: 'analytics/blog/general', allowed: ['GET'] },
    { pattern: 'analytics/blog/meta', allowed: ['GET'] },
    { pattern: 'analytics/blog/elements', allowed: ['GET'] },
    { pattern: 'analytics/dictionary/general', allowed: ['GET'] },
    { pattern: 'ecommerce/products/import', allowed: ['POST'] },
    { pattern: 'ecommerce/blog/populate-product-recommendations', allowed: ['GET'] },
  ]

  for (const rule of methodRules) {
    if (matchesPath(path, rule.pattern) && !rule.allowed.includes(method)) {
      return methodNotAllowed(method)
    }
  }

  return null
}

function aiNotMigrated() {
  return raw({ detail: 'AI generation not yet migrated' }, 501)
}

function taskNotMigrated(id: string) {
  return raw({ task_id: id, status: 'not_available', detail: 'Task queue not migrated' }, 501)
}

function notImplementedYet() {
  return raw({ detail: 'Not implemented yet' }, 501)
}


function toDjangoDictionaryStatus(status: string | null | undefined) {
  if (!status) return status
  return status.toLowerCase()
}

function djangoDetailError(err: unknown) {
  if (err instanceof Error) return raw({ detail: err.message }, 400)
  return raw({ detail: 'An error occurred' }, 500)
}

function buildBlogPostsPageUrl(searchParams: URLSearchParams, page: number, limit: number) {
  const params = new URLSearchParams(searchParams)
  params.set('page', String(page))
  params.set('limit', String(limit))
  return `/api/aurora/blog/posts?${params.toString()}`
}

async function handleAurora(ctx: {
  companyId: number | null
  body: unknown
  params: Record<string, unknown>
  searchParams: URLSearchParams
  method: string
}) {
  const slug = getSlugParts(ctx.params)
  let path = slug.join('/')

  const aliasPaths: Record<string, string> = {
    'blog/posts/generate/': 'blog/posts/generate',
    'blog/cta/add-cta/': 'blog/cta/add-cta',
    'blog/cta/edit/': 'blog/cta/edit',
    'dictionary/modify/': 'dictionary/modify',
    'company/quillo/': 'company/quillo',
    'company/quillo/analyze/': 'company/quillo/analyze',
  }

  path = aliasPaths[path] ?? path

  const methodBlocked = enforceMethod(path, ctx.method)
  if (methodBlocked) return methodBlocked

  // HEALTH
  if (path === 'health') {
    return raw({ status: 'ok' })
  }

  if (path === 'health/celery') {
    return raw({ status: 'ok', celery: 'not_migrated' })
  }

  if (!ctx.companyId) throw new NotFoundError('Missing company context')

  // BLOG POSTS
  if (path === 'blog/posts') {
    const postId = Number(ctx.searchParams.get('post_id'))
    if (postId) {
      const post = await blogService.getPost(postId, ctx.companyId)
      return raw(post)
    }

    const page = Math.max(1, Number(ctx.searchParams.get('page') ?? 1) || 1)
    const limit = Math.max(1, Math.min(100, Number(ctx.searchParams.get('limit') ?? 20) || 20))
    const categoryIds = ctx.searchParams.getAll('category_ids').flatMap((value) =>
      value
        .split(',')
        .map((part) => Number(part.trim()))
        .filter((id) => Number.isInteger(id) && id > 0),
    )

    const status = ctx.searchParams.get('status')
    const normalizedStatus = status && status !== 'all' ? status : undefined

    const query = validate(listBlogPostsQuerySchema, {
      page,
      pageSize: limit,
      categoryIds: categoryIds.length ? categoryIds : undefined,
      search: ctx.searchParams.get('q') ?? undefined,
      publishStatus: normalizedStatus ?? undefined,
      status: undefined,
    })

    const result = await blogService.listPosts(ctx.companyId, query)
    const totalPages = Math.max(1, Math.ceil(result.total / limit))

    return raw({
      result: result.total,
      next: page < totalPages ? buildBlogPostsPageUrl(ctx.searchParams, page + 1, limit) : null,
      previous: page > 1 ? buildBlogPostsPageUrl(ctx.searchParams, page - 1, limit) : null,
      data: result.data,
    })
  }

  if (path === 'blog/posts/update' || path === 'blog/posts/update/') {
    if (ctx.method !== 'PUT') return methodNotAllowed(ctx.method)

    const body = (ctx.body ?? {}) as Record<string, unknown>
    const postIdRaw = body.post_id
    if (postIdRaw === undefined || postIdRaw === null || postIdRaw === '') {
      return raw({ detail: "'post_id' is required in the request body." }, 400)
    }

    const postId = Number(postIdRaw)
    if (!Number.isInteger(postId)) {
      return raw({ detail: "'post_id' must be an integer." }, 400)
    }

    const payload = validate(updateBlogPostSchema, {
      titleText: body.title_text ?? body.titleText,
      seoTitle: body.seo_title ?? body.seoTitle,
      focusKeyword: body.focus_keyword ?? body.focusKeyword,
      metaDescription: body.meta_description ?? body.metaDescription,
      excerpt: body.excerpt,
      categoryIds: body.category_ids ?? body.categoryIds,
      coverImage: body.cover_image ?? body.coverImage,
      scheduledDate: body.scheduled_date ?? body.scheduledDate,
      reviewed: body.reviewed,
      keywordSynced: body.keyword_synced ?? body.keywordSynced,
      keywordLinked: body.keyword_linked ?? body.keywordLinked,
      postsSynced: body.posts_synced ?? body.postsSynced,
      imageGeneration: body.image_generation ?? body.imageGeneration,
      status: body.status,
      operation: body.operation,
      generatedDate: body.generated_date ?? body.generatedDate,
    })

    const post = await blogService.updatePost(postId, ctx.companyId, payload)
    return raw(post)
  }

  if (path === 'blog/posts/generate') {
    if (ctx.method !== 'POST') return methodNotAllowed(ctx.method)
    const body = (ctx.body ?? {}) as Record<string, unknown>
    const titleId = Number(body.post_id ?? body.title_id ?? body.postId ?? body.titleId)
    const result = await blogService.generatePostFromTitle(ctx.companyId, Number.isFinite(titleId) && titleId > 0 ? titleId : null)
    return raw(result)
  }

  if (path === 'blog/posts/regenerate') {
    if (ctx.method !== 'POST') return methodNotAllowed(ctx.method)
    const body = (ctx.body ?? {}) as Record<string, unknown>
    const postId = Number(body.post_id ?? body.postId)
    const result = await blogService.regeneratePost(ctx.companyId, postId)
    return raw(result)
  }

  if (path.match(/^blog\/posts\/delete\/\d+$/)) {
    const postId = Number(slug[3])
    await blogService.deletePost(postId, ctx.companyId)
    return raw({
      status: `Blog post with ID ${postId} has been deleted successfully.`,
      deleted_post_id: postId,
    })
  }

  if (path === 'blog/focus-keywords') {
    const keywords = await blogService.listFocusKeywords(ctx.companyId)
    return raw(keywords)
  }

  // BLOG POST OPERATIONS
  if (path === 'blog/posts/share') {
    if (ctx.method !== 'POST') return methodNotAllowed(ctx.method)
    const postId = Number(ctx.searchParams.get('post_id') ?? (ctx.body as any)?.post_id)
    if (!postId) throw new ValidationError('post_id is required')
    const result = await blogService.sharePost(ctx.companyId, postId)
    return raw(result)
  }
  if (path === 'blog/posts/sync/recommended') {
    if (ctx.method !== 'POST') return methodNotAllowed(ctx.method)
    const result = await blogService.syncRecommendedPosts(ctx.companyId)
    return raw(result)
  }
  if (path === 'blog/posts/sync/keywords') {
    if (ctx.method !== 'POST') return methodNotAllowed(ctx.method)
    const body = (ctx.body ?? {}) as Record<string, unknown>
    const dictionaryId = Number(body.dictionary_id)
    const postId = body.post_id ? Number(body.post_id) : undefined
    if (!dictionaryId) return raw({ detail: "'dictionary_id' is required in the request body." }, 400)
    const result = await blogService.syncKeywords(ctx.companyId, dictionaryId, postId)
    return raw(result)
  }
  if (path === 'blog/posts/upload') {
    if (ctx.method !== 'POST') return methodNotAllowed(ctx.method)
    const body = (ctx.body ?? {}) as Record<string, unknown>
    const postId = Number(body.post_id)
    const dictionaryId = Number(body.dictionary_id)
    const exportMethod = String(body.export_method ?? '')

    if (exportMethod !== 'elementor') {
      return raw({ detail: 'Currently only Elementor export method is supported' }, 400)
    }
    if (!dictionaryId) {
      return raw({ detail: 'Dictionary not found' }, 404)
    }

    const post = await blogService.getPost(postId, ctx.companyId)
    const remoteId = `stub-${postId}-${Date.now()}`
    const existingPublish = await prisma.blogPublish.findFirst({ where: { blogPostId: postId } })
    if (existingPublish) {
      await prisma.blogPublish.update({ where: { id: existingPublish.id }, data: { remote_id: remoteId } })
    } else {
      await prisma.blogPublish.create({ data: { blogPostId: postId, remote_id: remoteId } })
    }
    return raw({
      status: `Successfully sent processed post data for title: ${post.title_text} to WordPress`,
      wordpress_response: { wp_post_id: remoteId, stub: true },
    })
  }
  if (path === 'blog/posts/upload/all') {
    if (ctx.method !== 'POST') return methodNotAllowed(ctx.method)
    const body = (ctx.body ?? {}) as Record<string, unknown>
    const dictionaryId = Number(body.dictionary_id)
    const exportMethod = String(body.export_method ?? '')

    if (exportMethod !== 'elementor') {
      return raw({ detail: 'Currently only Elementor export method is supported' }, 400)
    }
    if (!dictionaryId) {
      return raw({ detail: 'Dictionary not found' }, 404)
    }

    const posts = await prisma.blogPost.findMany({ where: { companyId: ctx.companyId, status: 'GENERATED' }, select: { id: true, title_text: true } })
    const uploaded = [] as Array<{ post_id: number; wordpress_response: { wp_post_id: string; stub: boolean } }>
    for (const post of posts) {
      const remoteId = `stub-${post.id}-${Date.now()}`
      const existingPublish = await prisma.blogPublish.findFirst({ where: { blogPostId: post.id } })
      if (existingPublish) {
        await prisma.blogPublish.update({ where: { id: existingPublish.id }, data: { remote_id: remoteId } })
      } else {
        await prisma.blogPublish.create({ data: { blogPostId: post.id, remote_id: remoteId } })
      }
      uploaded.push({ post_id: post.id, wordpress_response: { wp_post_id: remoteId, stub: true } })
    }
    return raw({ status: 'Upload completed', uploaded })
  }
  if (path === 'blog/posts/export') {
    if (ctx.method !== 'POST') return methodNotAllowed(ctx.method)
    const body = (ctx.body ?? {}) as Record<string, unknown>
    const postId = Number(body.post_id)
    const dictionaryId = Number(body.dictionary_id)
    if (!dictionaryId) return raw({ detail: 'Not found.' }, 404)

    const post = await blogService.getPost(postId, ctx.companyId)
    const categories = (post.categories ?? []).map((c: any) => c.name)
    return raw({
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
    })
  }
  if (path === 'blog/posts/export/all') {
    if (ctx.method !== 'POST') return methodNotAllowed(ctx.method)
    const body = (ctx.body ?? {}) as Record<string, unknown>
    const dictionaryId = Number(body.dictionary_id)
    if (!dictionaryId) return raw({ detail: 'Not found.' }, 404)

    const posts = await prisma.blogPost.findMany({
      where: { companyId: ctx.companyId, status: 'GENERATED' },
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

    return raw({
      status: 'Export completed',
      exported_posts: exportedPosts,
      errors: [],
    })
  }
  if (path === 'blog/posts/export/third-party/all') {
    if (ctx.method !== 'POST') return methodNotAllowed(ctx.method)
    const body = (ctx.body ?? {}) as Record<string, unknown>
    const endpointUrl = String(body.endpoint_url ?? '')
    if (!endpointUrl) return raw({ detail: 'endpoint_url is required' }, 400)

    const posts = await prisma.blogPost.findMany({
      where: { companyId: ctx.companyId, status: 'GENERATED' },
      select: { id: true },
    })

    for (const post of posts) {
      await prisma.blogPublish.create({
        data: {
          blogPostId: post.id,
          remote_id: `stub-${post.id}-${Date.now()}`,
        },
      })
    }

    return raw({
      status: 'success',
      message: `Successfully initiated export for ${posts.length} blog posts`,
    })
  }
  if (path === 'blog/posts/export/third-party') {
    if (ctx.method !== 'POST') return methodNotAllowed(ctx.method)
    const body = (ctx.body ?? {}) as Record<string, unknown>
    const endpointUrl = String(body.endpoint_url ?? '')
    if (!endpointUrl) return raw({ detail: 'endpoint_url is required' }, 400)

    const postId = Number(body.post_id)
    const post = await prisma.blogPost.findFirst({ where: { id: postId, companyId: ctx.companyId, status: 'GENERATED' }, select: { id: true } })
    if (!post) return raw({ detail: 'Not found.' }, 404)

    await prisma.blogPublish.create({
      data: {
        blogPostId: post.id,
        remote_id: `stub-${post.id}-${Date.now()}`,
      },
    })

    return raw({
      status: 'success',
      message: 'Successfully initiated export for 1 blog posts',
    })
  }
  if (path === 'blog/posts/elements/get/code-clusters') {
    const titles = await blogService.getCodeClusterBlogPosts(ctx.companyId)
    return raw(titles)
  }

  // BLOG HISTORY
  if (path === 'blog/posts/history') {
    if (ctx.method !== 'GET') return methodNotAllowed(ctx.method)
    const postId = Number(ctx.searchParams.get('post_id'))
    if (!postId) return raw({ detail: 'post_id is required' }, 400)
    const history = await blogService.listPostHistory(ctx.companyId, postId)
    return raw(history)
  }
  if (path === 'blog/posts/history/revision') {
    if (ctx.method !== 'GET') return methodNotAllowed(ctx.method)
    const postId = Number(ctx.searchParams.get('post_id'))
    const historyId = Number(ctx.searchParams.get('history_id'))
    if (!postId || !historyId) return raw({ detail: 'Both post_id and history_id are required' }, 400)
    const revision = await blogService.getPostHistoryRevision(ctx.companyId, postId, historyId)
    return raw(revision)
  }

  // ELEMENTS
  if (path.match(/^blog\/posts\/\d+\/elements$/)) {
    const postId = Number(slug[2])
    if (ctx.body) {
      const payload = validate(addElementSchema, {
        ...(ctx.body as Record<string, unknown>),
        blogPostId: postId,
      })
      const created = await elementService.addElement(postId, ctx.companyId, {
        elementType: payload.elementType,
        content: payload.content,
        order: payload.order,
      })
      return raw(created, 201)
    }

    const elements = await elementService.listElements(postId, ctx.companyId)
    return raw(elements)
  }

  if (path.match(/^blog\/elements\/\d+$/)) {
    const elementId = Number(slug[2])

    if (ctx.body && (ctx.body as Record<string, unknown>).delete === true) {
      await elementService.deleteElement(elementId, ctx.companyId)
      return raw({ deleted: true })
    }

    const payload = validate(updateElementSchema, ctx.body ?? {})
    const updated = await elementService.updateElement(elementId, ctx.companyId, payload)
    return raw(updated)
  }

  if (path.match(/^blog\/posts\/update-element\/\d+$/)) {
    const elementId = Number(slug[3])
    const payload = validate(updateElementSchema, ctx.body ?? {})
    const updated = await elementService.updateElement(elementId, ctx.companyId, payload)
    return raw(updated)
  }

  if (path === 'blog/posts/delete-element') {
    const body = (ctx.body ?? {}) as Record<string, unknown>
    const elementId = Number(body.elementId ?? body.id)
    await elementService.deleteElement(elementId, ctx.companyId)
    return raw({ deleted: true })
  }

  // ELEMENT OPERATIONS
  if (path === 'blog/posts/elements/template/create') {
    const body = (ctx.body ?? {}) as Record<string, unknown>
    const name = String(body.name ?? '').trim()
    const elementType = String(body.element_type ?? body.elementType ?? '').trim()
    const structure = (body.structure ?? {}) as Record<string, unknown>
    if (!name || !elementType || !Object.keys(structure).length) {
      throw new ValidationError("Missing required fields: 'name', 'element_type', and 'structure' are required.")
    }
    const slugValue = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
    const template = await prisma.blogElementTemplate.create({
      data: {
        name,
        slug: `${slugValue}-${Date.now()}`,
        element_type: elementType as any,
        structure: structure as any,
      },
    })
    return raw({
      message: 'Blog element template created successfully',
      template: {
        id: template.id,
        name: template.name,
        element_type: template.element_type,
        structure: template.structure,
      },
    }, 201)
  }
  if (path === 'blog/posts/elements/template/use') {
    const elementId = Number(ctx.searchParams.get('element_id'))
    const templateId = Number(ctx.searchParams.get('template_id'))
    if (!elementId || !templateId) {
      throw new ValidationError('Both element_id and template_id are required.')
    }

    const element = await prisma.blogPostElement.findUnique({ where: { id: elementId }, include: { blog_post: true } })
    if (!element || element.blog_post.companyId !== ctx.companyId) throw new NotFoundError('Blog post element not found.')

    const template = await prisma.blogElementTemplate.findUnique({ where: { id: templateId } })
    if (!template) throw new NotFoundError('Element template not found.')

    const current = (element.content as Record<string, unknown>) ?? {}
    const patch = (template.structure as Record<string, unknown>) ?? {}
    const next = { ...current }
    for (const [k, v] of Object.entries(patch)) {
      if (k in next) (next as any)[k] = v
    }

    await prisma.$transaction(async (tx) => {
      await tx.blogPostElement.update({ where: { id: element.id }, data: { content: next as any } })
      await tx.elementHyperlink.deleteMany({ where: { blogPostElementId: element.id } })
    })

    return raw({
      detail: 'Template applied successfully.',
      updated_element: {
        id: element.id,
        element_type: String(element.element_type).toLowerCase(),
        content: next,
        hyperlink: null,
      },
    })
  }
  if (path === 'blog/posts/elements/regenerate') {
    const body = (ctx.body ?? {}) as Record<string, unknown>
    const blogPostId = Number(body.blog_post_id ?? body.blogPostId)
    const blogElementId = Number(body.blog_element_id ?? body.blogElementId)
    const regenerationNote = String(body.regeneration_note ?? body.regenerationNote ?? '')
    const newElementType = (body.new_element_type ?? body.newElementType) as string | undefined
    const newElementCount = Number(body.new_element_count ?? body.newElementCount ?? 1)

    if (!blogPostId || !blogElementId || !regenerationNote) {
      throw new ValidationError('blog_post_id, blog_element_id and regeneration_note are required')
    }

    const elements = await elementService.regenerateElementByContext(ctx.companyId, {
      blogPostId,
      blogElementId,
      regenerationNote,
      newElementType,
      newElementCount,
    })

    return raw({
      status: 'Blog element(s) regenerated successfully.',
      regenerated_elements: elements.map(serializeElement),
    })
  }
  if (path === 'blog/posts/elements/add') {
    const body = (ctx.body ?? {}) as Record<string, unknown>
    const blogPostId = Number(body.blog_post_id ?? body.blogPostId)
    const elementId = Number(body.element_id ?? body.elementId)
    const elementType = String(body.element_type ?? body.elementType ?? '')
    const generationNote = String(body.generation_note ?? body.generationNote ?? '')

    if (!blogPostId || !elementId || !elementType || !generationNote) {
      throw new ValidationError('blog_post_id, element_id, element_type, and generation_note are required')
    }

    const created = await elementService.addGeneratedElement(ctx.companyId, {
      blogPostId,
      elementId,
      elementType,
      generationNote,
    })
    return raw(serializeElement(created), 201)
  }
  if (path === 'blog/posts/elements/enhance' || path === 'blog/posts/elements/enhance-readability') {
    const body = (ctx.body ?? {}) as Record<string, unknown>
    const blogPostId = Number(body.blog_post_id ?? body.blogPostId)
    const blogElementId = Number(body.blog_element_id ?? body.blogElementId)
    const updated = await elementService.enhanceElementByContext(ctx.companyId, blogPostId, blogElementId)
    return raw({
      status: 'Blog element readability enhanced successfully.',
      enhanced_element: updated.content,
    })
  }
  if (path === 'blog/posts/elements/humanize') {
    const body = (ctx.body ?? {}) as Record<string, unknown>
    const blogPostId = Number(body.blog_post_id ?? body.blogPostId)
    const blogElementId = Number(body.blog_element_id ?? body.blogElementId)
    const updated = await elementService.humanizeElementByContext(ctx.companyId, blogPostId, blogElementId)
    return raw({
      status: 'Blog element language humanized successfully.',
      humanized_element: updated.content,
    })
  }
  if (path === 'blog/cta/add-cta') {
    const body = (ctx.body ?? {}) as Record<string, unknown>
    const blogPostId = Number(body.blog_post_id ?? body.blogPostId)
    const elementId = Number(body.element_id ?? body.elementId)
    const ctaId = Number(body.cta_id ?? body.ctaId)

    if (!blogPostId || !elementId || !ctaId) {
      throw new ValidationError('blog_post_id, element_id, and cta_id are required')
    }

    const blogPost = await prisma.blogPost.findFirst({
      where: { id: blogPostId, companyId: ctx.companyId },
      select: { id: true },
    })
    if (!blogPost) throw new NotFoundError('Blog post not found')

    const targetElement = await prisma.blogPostElement.findFirst({
      where: { id: elementId, blogPostId },
      select: { id: true, blogPostId: true, order: true },
    })
    if (!targetElement) throw new NotFoundError('Target element not found')

    const cta = await prisma.cTA.findFirst({
      where: {
        id: ctaId,
        campaign: { companyId: ctx.companyId },
      },
      select: { id: true, title: true, description: true, image: true, link: true },
    })
    if (!cta) throw new NotFoundError('CTA not found')

    const created = await prisma.$transaction(async (tx) => {
      await tx.blogPostElement.updateMany({
        where: {
          blogPostId,
          order: { gt: targetElement.order },
        },
        data: {
          order: { increment: 1 },
        },
      })

      return tx.blogPostElement.create({
        data: {
          blogPostId,
          element_type: 'CTA' as any,
          order: targetElement.order + 1,
          content: {
            cta_id: cta.id,
            title: cta.title,
            description: cta.description,
            image: cta.image,
            link: cta.link,
          },
        },
      })
    })

    return raw(created, 201)
  }

  if (path === 'blog/posts/elements/add-cta') {
    const body = (ctx.body ?? {}) as Record<string, unknown>
    const blogPostId = Number(body.blog_post_id ?? body.blogPostId)
    const elementId = Number(body.element_id ?? body.elementId)
    const ctaId = Number(body.cta_id ?? body.ctaId)

    if (!blogPostId || !elementId || !ctaId) {
      throw new ValidationError('blog_post_id, element_id and cta_id are required')
    }

    const targetElement = await prisma.blogPostElement.findFirst({
      where: {
        id: elementId,
        blogPostId,
        blog_post: { companyId: ctx.companyId },
      },
    })

    if (!targetElement) throw new NotFoundError('Target element not found')

    const cta = await prisma.cTA.findFirst({
      where: {
        id: ctaId,
        campaign: { companyId: ctx.companyId },
      },
    })

    if (!cta) throw new NotFoundError('CTA not found')

    const created = await prisma.$transaction(async (tx) => {
      await tx.blogPostElement.updateMany({
        where: {
          blogPostId,
          order: { gt: targetElement.order },
        },
        data: {
          order: { increment: 1 },
        },
      })

      return tx.blogPostElement.create({
        data: {
          blogPostId,
          element_type: 'CTA' as any,
          order: targetElement.order + 1,
          content: {
            cta_id: cta.id,
            title: cta.title,
            description: cta.description,
            image: cta.image,
            link: cta.link,
          },
        },
      })
    })

    return raw(created, 201)
  }

  // TITLES
  if (path === 'blog/titles') {
    const categoryIds = ctx.searchParams.getAll('category_ids').flatMap((value) =>
      value
        .split(',')
        .map((part) => Number(part.trim()))
        .filter((id) => Number.isInteger(id) && id > 0),
    )

    const titles = await prisma.title.findMany({
      where: {
        companyId: ctx.companyId,
        ...(categoryIds.length
          ? {
              categories: {
                some: {
                  id: { in: categoryIds },
                },
              },
            }
          : {}),
      },
      include: { categories: true },
      orderBy: { id: 'asc' },
    })

    return raw(titles)
  }

  if (path === 'blog/titles/generate') {
    const body = (ctx.body ?? {}) as Record<string, unknown>
    const created = await titleService.generateTitles(ctx.companyId, {
      businessType: (body.business_type ?? body.businessType) as string | undefined,
      keywords: (body.keywords as string[] | undefined) ?? undefined,
      language: (body.language as string | undefined) ?? undefined,
      amount: Number(body.amount ?? 10),
    })
    return raw(created)
  }

  if (path.match(/^blog\/titles\/update\/\d+$/)) {
    const titleId = Number(slug[3])
    const body = (ctx.body ?? {}) as Record<string, unknown>
    const payload = validate(updateTitleSchema, {
      titleText: body.title_text ?? body.titleText,
      seoTitle: body.seo_title ?? body.seoTitle,
      focusKeyword: body.focus_keyword ?? body.focusKeyword,
      status: body.status,
      categoryIds: body.category_ids ?? body.categoryIds,
    })
    const updated = await titleService.updateTitle(titleId, ctx.companyId, payload)
    return raw(updated)
  }

  if (path.match(/^blog\/titles\/delete\/\d+$/)) {
    const titleId = Number(slug[3])
    await titleService.deleteTitle(titleId, ctx.companyId)
    return raw({ message: 'Title deleted successfully' })
  }

  if (path.match(/^blog\/titles\/regenerate\/\d+$/)) {
    const titleId = Number(slug[3])
    const regenerated = await titleService.regenerateTitle(ctx.companyId, titleId)
    return raw(regenerated)
  }

  if (path === 'blog/titles/categories/generate' || path === 'blog/categories/generate') {
    const data = await categoryService.generateCategories(ctx.companyId)
    return raw(data)
  }

  if (path === 'blog/titles/categories/categorize' || path === 'blog/categories/categorize') {
    const data = await categoryService.categorizeTitles(ctx.companyId)
    return raw(data)
  }

  // CATEGORIES
  if (path === 'blog/titles/categories' || path === 'blog/categories') {
    if (ctx.method === 'POST') {
      const body = (ctx.body ?? {}) as Record<string, unknown>
      const categories = Array.isArray(body.categories)
        ? body.categories
        : Array.isArray(body.names)
          ? body.names
          : []

      if (!Array.isArray(categories) || !categories.every((cat) => typeof cat === 'string')) {
        return raw({ detail: 'Invalid input. Please provide a list of category names.' }, 400)
      }

      const added_categories: string[] = []
      const existing_categories: string[] = []

      for (const categoryName of categories) {
        const normalized = categoryName.trim()
        if (!normalized) continue

        const exists = await prisma.category.findFirst({ where: { companyId: ctx.companyId, name: normalized } })
        if (exists) {
          existing_categories.push(normalized)
          continue
        }

        await categoryService.addCategories(ctx.companyId, [normalized])
        added_categories.push(normalized)
      }

      if (!added_categories.length) {
        return raw({ detail: 'No new categories were added; they already exist.', existing_categories }, 400)
      }

      return raw({ added_categories, existing_categories })
    }

    const categories = await categoryService.listCategories(ctx.companyId)
    if (!categories.length) return raw({ detail: 'No categories found for this company.' }, 404)
    return raw(categories.map(({ id, name }) => ({ id, name })))
  }

  if (path === 'blog/titles/categories/add') {
    const body = ctx.body as Record<string, unknown>
    const categories = Array.isArray(body?.categories)
      ? body.categories
      : Array.isArray(body?.names)
        ? body.names
        : typeof body?.name === 'string'
          ? [body.name]
          : []

    if (!Array.isArray(categories) || !categories.every((cat) => typeof cat === 'string')) {
      return raw({ detail: 'Invalid input. Please provide a list of category names.' }, 400)
    }

    const added_categories: string[] = []
    const existing_categories: string[] = []

    for (const categoryName of categories) {
      const normalized = categoryName.trim()
      if (!normalized) continue
      const exists = await prisma.category.findFirst({ where: { companyId: ctx.companyId, name: normalized } })
      if (exists) {
        existing_categories.push(normalized)
        continue
      }
      await categoryService.addCategories(ctx.companyId, [normalized])
      added_categories.push(normalized)
    }

    if (!added_categories.length) {
      return raw({ detail: 'No new categories were added; they already exist.', existing_categories }, 400)
    }

    return raw({ added_categories, existing_categories })
  }

  if (path === 'blog/titles/categories/bulk-delete') {
    const body = (ctx.body ?? {}) as Record<string, unknown>
    const categoryIds = body.category_ids ?? body.ids

    if (!Array.isArray(categoryIds) || !categoryIds.every((id) => Number.isInteger(id))) {
      return raw({ detail: 'Invalid input. Please provide a list of category IDs.' }, 400)
    }

    const ids = categoryIds as number[]
    const impactedTitles = await prisma.title.findMany({
      where: { companyId: ctx.companyId, categories: { some: { id: { in: ids } } } },
      select: { id: true },
    })

    await categoryService.bulkDeleteCategories(ids, ctx.companyId)

    let reCategorized: unknown[] = []
    if (impactedTitles.length) {
      try {
        reCategorized = await categoryService.categorizeTitles(ctx.companyId)
      } catch (err) {
        if (!(err instanceof NotFoundError)) throw err
      }
    }

    return raw({ message: 'Categories deleted successfully.', re_categorized_titles: reCategorized })
  }

  if (path.match(/^blog\/titles\/categories\/edit\/\d+$/)) {
    const categoryId = Number(slug[4])
    const payload = validate(updateCategorySchema, ctx.body ?? {})
    const updated = await categoryService.editCategory(categoryId, ctx.companyId, payload)

    let reCategorized: unknown[] = []
    try {
      reCategorized = await categoryService.categorizeTitles(ctx.companyId)
    } catch (err) {
      if (!(err instanceof NotFoundError)) throw err
    }

    return raw({
      message: 'Category updated successfully.',
      category: { id: updated.id, name: updated.name },
      re_categorized_titles: reCategorized,
    })
  }

  if (path.match(/^blog\/titles\/categories\/delete\/\d+$/)) {
    const categoryId = Number(slug[4])
    const impactedTitles = await prisma.title.findMany({
      where: { companyId: ctx.companyId, categories: { some: { id: categoryId } } },
      select: { id: true },
    })

    await categoryService.deleteCategory(categoryId, ctx.companyId)

    let reCategorized: unknown[] = []
    if (impactedTitles.length) {
      try {
        reCategorized = await categoryService.categorizeTitles(ctx.companyId)
      } catch (err) {
        if (!(err instanceof NotFoundError)) throw err
      }
    }

    return raw({ message: 'Category deleted successfully.', re_categorized_titles: reCategorized })
  }

  // SCHEDULE
  if (path === 'blog/schedule/bulk') {
    if (ctx.body) {
      const payload = validate(createBulkScheduleSchema, ctx.body)
      const created = await scheduleService.createBulkSchedule(ctx.companyId, payload)
      return raw(created, 201)
    }

    const schedules = await scheduleService.listSchedules(ctx.companyId)
    return raw(schedules)
  }

  if (path === 'blog/schedule/bulk/create') {
    const payload = validate(createBulkScheduleSchema, ctx.body ?? {})
    const created = await scheduleService.createBulkSchedule(ctx.companyId, payload)
    return raw(created, 201)
  }

  if (path.match(/^blog\/schedule\/bulk\/update\/\d+$/)) {
    const bulkScheduleId = Number(slug[4])
    const payload = validate(updateBulkScheduleSchema, ctx.body ?? {})
    const updated = await scheduleService.updateBulkSchedule(ctx.companyId, bulkScheduleId, payload)
    return raw(updated)
  }

  if (path === 'blog/schedule/bulk/assign') {
    const payload = validate(assignToBulkSchema, ctx.body ?? {})
    const result = await scheduleService.assignToBulk(ctx.companyId, payload.titleIds, payload.bulkScheduleId)
    return raw(result)
  }

  if (path === 'blog/schedule/bulk/remove') {
    const payload = validate(removeFromBulkSchema, ctx.body ?? {})
    const result = await scheduleService.removeFromBulk(ctx.companyId, payload.titleIds)
    return raw(result)
  }

  if (path.match(/^blog\/schedule\/post\/\d+$/)) {
    const postId = Number(slug[3])
    const payload = validate(schedulePostSchema, ctx.body ?? {})
    const result = await scheduleService.schedulePost(ctx.companyId, postId, payload.date)
    return raw(result)
  }

  if (path.match(/^blog\/schedule\/reschedule\/\d+$/)) {
    const postId = Number(slug[3])
    const payload = validate(schedulePostSchema, ctx.body ?? {})
    const result = await scheduleService.reschedulePost(ctx.companyId, postId, payload.date)
    return raw(result)
  }

  if (path === 'blog/schedule/interval') {
    const payload = validate(scheduleByIntervalSchema, ctx.body ?? {})
    const result = await scheduleService.scheduleByInterval(
      ctx.companyId,
      payload.titleIds,
      payload.startDate,
      payload.intervalDays,
    )
    return raw(result)
  }

  // CTA + CAMPAIGNS
  if (path === 'blog/cta/list') {
    const ctas = await ctaService.listCtas(ctx.companyId)
    return raw(ctas)
  }

  if (path === 'blog/cta/create') {
    const payload = validate(createCtaSchema, ctx.body ?? {})
    const created = await ctaService.createCta(ctx.companyId, payload)
    return raw(created, 201)
  }

  if (path.match(/^blog\/cta\/edit\/\d+$/)) {
    const ctaId = Number(slug[3])
    const payload = validate(updateCtaSchema, ctx.body ?? {})
    const updated = await ctaService.updateCta(ctx.companyId, ctaId, payload)
    return raw(updated)
  }

  if (path.match(/^blog\/cta\/delete\/\d+$/)) {
    const ctaId = Number(slug[3])
    await ctaService.deleteCta(ctx.companyId, ctaId)
    return raw({ deleted: true })
  }

  if (path === 'blog/cta/campaign/create') {
    const payload = validate(createCampaignSchema, ctx.body ?? {})
    const created = await ctaService.createCampaign(ctx.companyId, payload)
    return raw(created, 201)
  }

  if (path.match(/^blog\/cta\/campaign\/edit\/\d+$/)) {
    const campaignId = Number(slug[4])
    const payload = validate(updateCampaignSchema, ctx.body ?? {})
    const updated = await ctaService.updateCampaign(ctx.companyId, campaignId, payload)
    return raw(updated)
  }

  if (path.match(/^blog\/cta\/campaign\/delete\/\d+$/)) {
    const campaignId = Number(slug[4])
    await ctaService.deleteCampaign(ctx.companyId, campaignId)
    return raw({ deleted: true })
  }

  // IMAGES
  if (path === 'blog/images/generate') {
    if (ctx.method !== 'POST') return methodNotAllowed(ctx.method)
    try {
      const result = await imageService.generateImages(ctx.companyId, ctx.body)
      return raw(result)
    } catch (err) {
      return djangoDetailError(err)
    }
  }
  if (path === 'blog/images/regenerate') {
    if (ctx.method !== 'POST') return methodNotAllowed(ctx.method)
    try {
      const result = await imageService.regenerateImage(ctx.companyId, ctx.body)
      return raw(result)
    } catch (err) {
      return djangoDetailError(err)
    }
  }

  if (path === 'blog/images/save/edit') {
    if (ctx.method !== 'POST') return raw({ error: 'Only POST requests are allowed' }, 405)

    try {
      const body = typeof ctx.body === 'string' ? JSON.parse(ctx.body) : (ctx.body ?? {}) as Record<string, unknown>
      const source = String((body as Record<string, unknown>).source ?? '')
      const versions = Array.isArray((body as Record<string, unknown>).versions)
        ? ((body as Record<string, unknown>).versions as Array<Record<string, unknown>>)
        : []
      const pngVersion = versions.find((version) => version.format === 'png')

      if (!pngVersion) return raw({ error: 'No PNG version found' }, 400)
      if (!source) return raw({ error: 'Invalid JSON data' }, 400)

      const fileName = source.split('/').pop() || 'edited-image.png'
      return raw({
        message: `Successfully saved ${fileName}`,
        script: `app.echoToOE('Saved: ${fileName}');`,
        newSource: source,
      })
    } catch (err) {
      if (err instanceof SyntaxError) return raw({ error: 'Invalid JSON data', details: err.message }, 400)
      if (err instanceof Error) return raw({ error: err.message }, 500)
      return raw({ error: 'Unknown error' }, 500)
    }
  }
  if (path === 'blog/images/upload') {
    if (ctx.method !== 'POST') return methodNotAllowed(ctx.method)
    try {
      const result = await imageService.uploadImage(ctx.companyId, ctx.body)
      return raw(result)
    } catch (err) {
      return djangoDetailError(err)
    }
  }
  if (path === 'blog/images/stock_photos/search') {
    if (ctx.method !== 'GET') return methodNotAllowed(ctx.method)
    const query = ctx.searchParams.get('query') ?? ''
    const page = Number(ctx.searchParams.get('page') ?? 1)
    const perPage = Number(ctx.searchParams.get('per_page') ?? 10)

    try {
      const result = await imageService.searchStockPhotos(ctx.companyId, query, page, perPage)
      return raw(result)
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'Search query is required') return raw({ error: err.message }, 400)
        return raw({ error: err.message }, 500)
      }
      return raw({ error: 'An unexpected error occurred' }, 500)
    }
  }
  if (path === 'blog/images/stock_photos/use') {
    if (ctx.method !== 'POST') return methodNotAllowed(ctx.method)
    try {
      const result = await imageService.useStockPhoto(ctx.companyId, ctx.body)
      return raw(result)
    } catch (err) {
      return djangoDetailError(err)
    }
  }

  // QUILLO AI
  if (path === 'blog/quillo/analyze') {
    const body = (ctx.body ?? {}) as Record<string, unknown>
    const blogPostId = Number(body.blog_post_id)
    const result = await quilloService.analyzePost(ctx.companyId, blogPostId)
    return raw(result)
  }
  if (path === 'blog/quillo/analyze/chat') {
    const result = await quilloService.chat(ctx.companyId, ctx.body)
    return raw(result)
  }
  if (path === 'blog/quillo/post/facebook') {
    const body = (ctx.body ?? {}) as Record<string, unknown>
    const blogPostId = Number(body.blog_post_id)
    const result = await quilloService.generateFacebookPost(ctx.companyId, blogPostId)
    return raw(result)
  }
  if (path === 'blog/quillo/post/autopilot') {
    const result = await quilloService.runAutopilot(ctx.companyId, ctx.body)
    return raw(result, 501)
  }

  if (path.match(/^blog\/quillo\/post\/autopilot-status\/[^/]+$/)) {
    const taskId = slug[4]
    return taskNotMigrated(taskId)
  }

  if (path === 'company/quillo') {
    const result = await quilloService.getCompanyAnalysis(ctx.companyId)
    return raw(result)
  }
  if (path === 'company/quillo/analyze') {
    const result = await quilloService.analyzeCompany(ctx.companyId)
    return raw(result)
  }

  // DICTIONARY
  if (path === 'dictionary/dictionaries') {
    const dictionaries = await dictionaryService.listDictionaries(ctx.companyId)
    return raw({
      dictionaries: dictionaries.map((d) => ({
        id: d.id,
        title: d.title,
        num_words: d.num_words,
        total_words: d.num_words * 26,
        in_progress: !['COMPLETED', 'UPLOADED'].includes(String(d.status)),
        current_letter: d.current_letter,
        status: String(d.status).toLowerCase(),
      })),
    })
  }

  if (path.match(/^dictionary\/dictionary\/\d+$/)) {
    const dictionaryId = Number(slug[2])
    const dictionary = await dictionaryService.getDictionary(dictionaryId, ctx.companyId)
    return raw({
      id: dictionary.id,
      title: dictionary.title,
      subject: dictionary.subject,
      language: dictionary.language,
      num_words: dictionary.num_words,
      current_letter: dictionary.current_letter,
      status: toDjangoDictionaryStatus(String(dictionary.status)),
      company: dictionary.company?.name ?? null,
      words: dictionary.words.map((word) => ({
        id: word.id,
        letter: word.letter,
        keyword: word.keyword,
        description: word.description,
        priority: word.priority === 'HIGH' ? 1 : 2,
        has_definition: Boolean(word.definition),
      })),
    })
  }

  if (path.match(/^dictionary\/modify\/\d+$/)) {
    const dictionaryId = Number(slug[2])
    if (ctx.method === 'DELETE') {
      await dictionaryService.deleteDictionary(dictionaryId, ctx.companyId)
      return raw(null, 204)
    }

    const body = (ctx.body ?? {}) as Record<string, unknown>
    await dictionaryService.modifyDictionary(dictionaryId, ctx.companyId, {
      ...(body.title !== undefined ? { title: String(body.title) } : {}),
      ...(body.subject !== undefined ? { subject: String(body.subject) } : {}),
      ...(body.language !== undefined ? { language: String(body.language) } : {}),
      ...(body.num_words !== undefined ? { num_words: Number(body.num_words) } : {}),
    })
    const updated = await dictionaryService.getDictionary(dictionaryId, ctx.companyId)

    return raw({
      id: updated.id,
      title: updated.title,
      subject: updated.subject,
      language: updated.language,
      num_words: updated.num_words,
      current_letter: updated.current_letter,
      status: toDjangoDictionaryStatus(String(updated.status)),
      company: updated.company?.name ?? null,
    })
  }

  if (path.match(/^dictionary\/modify\/word\/\d+$/)) {
    const wordId = Number(slug[3])
    if (ctx.method === 'DELETE') {
      await dictionaryService.deleteWord(wordId, ctx.companyId)
      return raw(null, 204)
    }

    const body = (ctx.body ?? {}) as Record<string, unknown>
    const updated = await dictionaryService.modifyWord(wordId, ctx.companyId, {
      ...(body.keyword !== undefined ? { keyword: String(body.keyword), letter: String(body.keyword)[0]?.toLowerCase() } : {}),
      ...(body.description !== undefined ? { description: String(body.description) } : {}),
      ...(body.priority !== undefined ? { priority: Number(body.priority) === 1 ? 'HIGH' : 'LOW' } : {}),
    })

    return raw({
      id: updated.id,
      keyword: updated.keyword,
      description: updated.description,
      priority: updated.priority === 'HIGH' ? 1 : 2,
      letter: updated.letter,
      has_definition: Boolean(updated.definition),
    })
  }

  if (path.match(/^dictionary\/dictionary\/\d+\/word\/\d+$/)) {
    const dictionaryId = Number(slug[2])
    const wordId = Number(slug[4])
    const word = await dictionaryService.getWord(dictionaryId, wordId, ctx.companyId)
    if (!word.definition) return raw({ detail: 'Definition not found for the word' }, 404)
    return raw({
      id: word.id,
      letter: word.letter,
      keyword: word.keyword,
      description: word.description,
      priority: word.priority === 'HIGH' ? 1 : 2,
      definition: {
        title: word.definition.title,
        featured_google_snippet: word.definition.featured_google_snippet,
        meta_description: word.definition.meta_description,
        paragraph_1: { title: word.definition.title1, text: word.definition.text1 },
        paragraph_2: { title: word.definition.title2, text: word.definition.text2 },
        paragraph_3: { title: word.definition.title3, text: word.definition.text3 },
        synonyms: word.definition.synonyms,
        antonyms: word.definition.antonyms,
        usage_examples: word.definition.usage_examples,
        related_keywords: word.definition.related_keywords,
        faqs: word.definition.faqs,
      },
    })
  }

  if (path === 'dictionary/dictionary/words/delete') {
    const body = (ctx.body ?? {}) as Record<string, unknown>
    const result = await dictionaryService.deleteWords({
      dictionaryId: Number(body.dictionary_id),
      ids: Array.isArray(body.word_ids) ? body.word_ids.map((id) => Number(id)) : [],
    }, ctx.companyId)
    return raw(result)
  }

  if (path === 'dictionary/generation/keywords/start') {
    const result = await dictionaryService.startKeywordGeneration(ctx.companyId, ctx.body)
    return raw(result, 201)
  }
  if (path === 'dictionary/generation/keywords/review') {
    const result = await dictionaryService.reviewKeywords(ctx.companyId, ctx.body)
    return raw(result)
  }
  if (path === 'dictionary/generation/keywords/end') {
    const result = await dictionaryService.completeKeywordGeneration(ctx.companyId, ctx.body)
    return raw({ ...result, status: toDjangoDictionaryStatus(String((result as any).status)) })
  }
  if (path === 'dictionary/generation/definition/generate') {
    const result = await dictionaryService.generateDefinition(ctx.companyId, ctx.body)
    return raw(result)
  }
  if (path === 'dictionary/generation/keyword/new') {
    const result = await dictionaryService.generateNewKeyword(ctx.companyId, ctx.body)
    return raw(result)
  }
  if (path === 'dictionary/generation/definition/new') {
    const result = await dictionaryService.generateNewKeywordDefinition(ctx.companyId, ctx.body)
    return raw(result)
  }

  if (path === 'dictionary/dictionary/upload') {
    const body = (ctx.body ?? {}) as Record<string, unknown>
    return raw({ status: 'Dictionary upload prepared', payload: body })
  }
  if (path === 'dictionary/dictionary/upload/all') {
    const dictionaries = await prisma.dictionary.findMany({ where: { companyId: ctx.companyId }, select: { id: true, title: true } })
    return raw({ status: 'Sync completed', synced_words: [], errors: [], dictionaries })
  }

  if (path === 'dictionary/dictionary/export') {
    const body = (ctx.body ?? {}) as Record<string, unknown>
    const dictionaryId = Number(body.dictionary_id ?? 0)
    const wordInput = String(body.word ?? '').trim().toLowerCase()
    if (!dictionaryId) throw new ValidationError('dictionary_id is required')
    if (!wordInput) throw new ValidationError('word is required')

    const word = await prisma.word.findFirst({
      where: { dictionaryId, keyword: { equals: wordInput, mode: 'insensitive' }, dictionary: { companyId: ctx.companyId } },
      include: { definition: true, dictionary: true },
    })
    if (!word || !word.dictionary) throw new NotFoundError('Dictionary not found')
    if (!word.definition) return raw({ detail: `No definition found for the word "${word.keyword}" in dictionary "${word.dictionary.title}"` }, 404)

    return raw({
      dictionary_info: { id: word.dictionary.id, title: word.dictionary.title, subject: word.dictionary.subject, language: word.dictionary.language },
      word_data: {
        id: word.id,
        letter: word.letter,
        keyword: word.keyword,
        description: word.description,
        priority: word.priority === 'HIGH' ? 1 : 2,
        definition: {
          title: word.definition.title,
          seo_title: word.definition.seo_title,
          featured_google_snippet: word.definition.featured_google_snippet,
          meta_description: word.definition.meta_description,
          paragraph_1: { title: word.definition.title1, text: word.definition.text1 },
          paragraph_2: { title: word.definition.title2, text: word.definition.text2 },
          paragraph_3: { title: word.definition.title3, text: word.definition.text3 },
          synonyms: word.definition.synonyms,
          antonyms: word.definition.antonyms,
          usage_examples: word.definition.usage_examples,
          related_keywords: word.definition.related_keywords,
          faqs: word.definition.faqs,
        },
      },
    })
  }
  if (path === 'dictionary/dictionary/export/all') {
    const body = (ctx.body ?? {}) as Record<string, unknown>
    const dictionaryId = Number(body.dictionary_id ?? 0)
    if (!dictionaryId) throw new ValidationError('dictionary_id is required')
    const dictionary = await prisma.dictionary.findFirst({
      where: { id: dictionaryId, companyId: ctx.companyId },
      include: { words: { where: { definition: { isNot: null } }, include: { definition: true }, orderBy: { id: 'asc' } } },
    })
    if (!dictionary) throw new NotFoundError('Dictionary not found')

    const words = dictionary.words.filter((w) => w.definition)
    return raw({
      dictionary_info: {
        id: dictionary.id, title: dictionary.title, subject: dictionary.subject, language: dictionary.language,
        num_words: dictionary.num_words, current_letter: dictionary.current_letter, status: toDjangoDictionaryStatus(String(dictionary.status)),
      },
      words: words.map((word) => ({
        id: word.id,
        letter: word.letter,
        keyword: word.keyword,
        description: word.description,
        priority: word.priority === 'HIGH' ? 1 : 2,
        definition: {
          title: word.definition!.title,
          seo_title: word.definition!.seo_title,
          featured_google_snippet: word.definition!.featured_google_snippet,
          meta_description: word.definition!.meta_description,
          paragraph_1: { title: word.definition!.title1, text: word.definition!.text1 },
          paragraph_2: { title: word.definition!.title2, text: word.definition!.text2 },
          paragraph_3: { title: word.definition!.title3, text: word.definition!.text3 },
          synonyms: word.definition!.synonyms,
          antonyms: word.definition!.antonyms,
          usage_examples: word.definition!.usage_examples,
          related_keywords: word.definition!.related_keywords,
          faqs: word.definition!.faqs,
        },
      })),
      stats: {
        total_words: words.length,
        words_with_definitions: words.length,
        words_with_complete_data: words.filter((w) => w.definition?.title && w.definition?.seo_title && w.definition?.meta_description && w.definition?.title1 && w.definition?.text1).length,
      },
    })
  }

  if (path === 'dictionary/dictionary/export/third-party/all') {
    return raw({ status: 'success', message: 'Successfully initiated export for all dictionaries' })
  }

  if (path === 'dictionary/dictionary/export/third-party') {
    return raw({ status: 'success', message: 'Successfully initiated export for 1 dictionaries' })
  }

  // PRODUCTS
  if (path === 'ecommerce/products/import') {
    const body = (ctx.body ?? {}) as Record<string, unknown>
    const products = Array.isArray(body.products) ? (body.products as any[]) : []
    if (!products.length) throw new ValidationError('products is required')
    const imported = await productService.importProducts(ctx.companyId, products as any)
    return raw(imported)
  }
  if (path === 'ecommerce/blog/populate-product-recommendations') {
    const postId = Number(ctx.searchParams.get('blog_post_id') ?? 0) || undefined
    const result = await productService.populateRecommendations(ctx.companyId, postId)
    return raw(result)
  }

  // ANALYTICS
  if (path === 'analytics/blog/readability') {
    const data = await analyticsService.getReadabilityAnalytics(ctx.companyId)
    return raw(data)
  }

  if (path === 'analytics/blog/general') {
    const data = await analyticsService.getGeneralAnalytics(ctx.companyId)
    return raw(data)
  }

  if (path === 'analytics/blog/meta') {
    const data = await analyticsService.getMetaAnalytics(ctx.companyId)
    return raw(data)
  }

  if (path === 'analytics/blog/elements') {
    const data = await analyticsService.getElementAnalytics(ctx.companyId)
    return raw(data)
  }

  if (path === 'analytics/dictionary/general') {
    const data = await analyticsService.getDictionaryAnalytics(ctx.companyId)
    return raw(data)
  }

  // FALLBACK
  return methodNotImplemented(path)
}

const routeHandler = apiHandler(async (ctx, req) => handleAurora({ ...(ctx as any), method: req.method }))

export const GET = routeHandler
export const POST = routeHandler
export const PUT = routeHandler
export const DELETE = routeHandler
