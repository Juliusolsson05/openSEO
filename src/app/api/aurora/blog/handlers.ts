import { z } from 'zod'

import { prisma } from '@/lib/prisma'
import { NotFoundError, ValidationError } from '@/server/api/errors'
import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { BLOCK_SCHEMAS } from '@/server/ai/constants/block-schemas'
import { blogService } from '@/server/services/blog.service'
import { elementService } from '@/server/services/element.service'
import { imageService } from '@/server/services/image.service'
import { quilloService } from '@/server/services/quillo.service'
import { blogPostIdSchema, listBlogPostsQuerySchema, updateBlogPostSchema } from '@/server/validators/blog.validators'
import { addElementSchema, updateElementSchema } from '@/server/validators/element.validators'
import { serializeElement } from '@/server/utils/element-type'
import { getTask } from '@/server/tasks/runtime'

function buildBlogPostsPageUrl(searchParams: URLSearchParams, page: number, limit: number) {
  const params = new URLSearchParams(searchParams)
  params.set('page', String(page))
  params.set('limit', String(limit))
  return `/api/aurora/blog/posts?${params.toString()}`
}

function djangoDetailError(err: unknown) {
  if (err instanceof Error) return raw({ detail: err.message }, 400)
  return raw({ detail: 'An error occurred' }, 500)
}

export const getPostsHandler = apiHandler(async (ctx) => {
  const postId = Number(ctx.searchParams.get('post_id'))
  if (postId) return raw(await blogService.getPost(postId, ctx.companyId!))

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

  const result = await blogService.listPosts(ctx.companyId!, query)
  const totalPages = Math.max(1, Math.ceil(result.total / limit))

  return raw({
    result: result.total,
    next: page < totalPages ? buildBlogPostsPageUrl(ctx.searchParams, page + 1, limit) : null,
    previous: page > 1 ? buildBlogPostsPageUrl(ctx.searchParams, page - 1, limit) : null,
    data: result.data,
  })
})

export const generatePostHandler = apiHandler(async (ctx) => {
  const body = (ctx.body ?? {}) as Record<string, unknown>
  const titleId = Number(body.post_id ?? body.title_id ?? body.postId ?? body.titleId)
  return raw(await blogService.generatePostFromTitle(ctx.companyId!, Number.isFinite(titleId) && titleId > 0 ? titleId : null))
})

export const regeneratePostHandler = apiHandler(async (ctx) => {
  const body = (ctx.body ?? {}) as Record<string, unknown>
  return raw(await blogService.regeneratePost(ctx.companyId!, Number(body.post_id ?? body.postId)))
})

export const deletePostHandler = apiHandler(async (ctx) => {
  const postId = Number(ctx.params.id)
  await blogService.deletePost(postId, ctx.companyId!)
  return raw({ status: `Blog post with ID ${postId} has been deleted successfully.`, deleted_post_id: postId })
})

export const updatePostHandler = apiHandler(async (ctx) => {
  const body = (ctx.body ?? {}) as Record<string, unknown>
  const postIdRaw = body.post_id ?? body.postId ?? ctx.params.id ?? ctx.searchParams.get('post_id')
  if (postIdRaw === undefined || postIdRaw === null || postIdRaw === '') {
    return raw({ detail: "'post_id' is required in the request body." }, 400)
  }

  const postId = Number(postIdRaw)
  if (!Number.isInteger(postId)) return raw({ detail: "'post_id' must be an integer." }, 400)

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

  return raw(await blogService.updatePost(postId, ctx.companyId!, payload))
})

export const sharePostHandler = apiHandler(async (ctx) => {
  const postId = Number(ctx.searchParams.get('post_id') ?? (ctx.body as any)?.post_id)
  if (!postId) throw new ValidationError('post_id is required')
  return raw(await blogService.sharePost(ctx.companyId!, postId, ctx.user?.id ?? null))
})

export const syncRecommendedHandler = apiHandler(async (ctx) => raw(await blogService.syncRecommendedPosts(ctx.companyId!)))

export const syncKeywordsHandler = apiHandler(async (ctx) => {
  const body = (ctx.body ?? {}) as Record<string, unknown>
  const dictionaryId = Number(body.dictionary_id)
  const postId = body.post_id ? Number(body.post_id) : undefined
  if (!dictionaryId) return raw({ detail: "'dictionary_id' is required in the request body." }, 400)
  return raw(await blogService.syncKeywords(ctx.companyId!, dictionaryId, postId))
})

export const uploadPostHandler = apiHandler(async (ctx) => {
  const body = (ctx.body ?? {}) as Record<string, unknown>
  try {
    const result = await blogService.uploadPost(ctx.companyId!, Number(body.post_id), Number(body.dictionary_id), String(body.export_method ?? ''))
    return raw(result)
  } catch (err) {
    if (err instanceof ValidationError) return raw({ detail: err.message }, 400)
    if (err instanceof NotFoundError) return raw({ detail: err.message }, err.message === 'Dictionary not found' ? 404 : 404)
    throw err
  }
})

export const uploadAllPostsHandler = apiHandler(async (ctx) => {
  const body = (ctx.body ?? {}) as Record<string, unknown>
  try {
    return raw(await blogService.uploadAllPosts(ctx.companyId!, Number(body.dictionary_id), String(body.export_method ?? '')))
  } catch (err) {
    if (err instanceof ValidationError) return raw({ detail: err.message }, 400)
    if (err instanceof NotFoundError) return raw({ detail: err.message }, 404)
    throw err
  }
})

export const exportPostHandler = apiHandler(async (ctx) => {
  const body = (ctx.body ?? {}) as Record<string, unknown>
  try {
    return raw(await blogService.exportPost(ctx.companyId!, Number(body.post_id), Number(body.dictionary_id)))
  } catch (err) {
    if (err instanceof NotFoundError) return raw({ detail: err.message }, 404)
    throw err
  }
})

export const exportAllPostsHandler = apiHandler(async (ctx) => {
  const body = (ctx.body ?? {}) as Record<string, unknown>
  try {
    return raw(await blogService.exportAllPosts(ctx.companyId!, Number(body.dictionary_id)))
  } catch (err) {
    if (err instanceof NotFoundError) return raw({ detail: err.message }, 404)
    throw err
  }
})

export const exportThirdPartyHandler = apiHandler(async (ctx) => {
  const body = (ctx.body ?? {}) as Record<string, unknown>
  try {
    return raw(await blogService.exportThirdParty(ctx.companyId!, Number(body.post_id), String(body.endpoint_url ?? '')))
  } catch (err) {
    if (err instanceof ValidationError) return raw({ detail: err.message }, 400)
    if (err instanceof NotFoundError) return raw({ detail: err.message }, 404)
    throw err
  }
})

export const exportThirdPartyAllHandler = apiHandler(async (ctx) => {
  const body = (ctx.body ?? {}) as Record<string, unknown>
  try {
    return raw(await blogService.exportThirdPartyAll(ctx.companyId!, String(body.endpoint_url ?? '')))
  } catch (err) {
    if (err instanceof ValidationError) return raw({ detail: err.message }, 400)
    throw err
  }
})

export const postHistoryHandler = apiHandler(async (ctx) => {
  const postId = Number(ctx.searchParams.get('post_id'))
  if (!postId) return raw({ detail: 'post_id is required' }, 400)
  return raw(await blogService.listPostHistory(ctx.companyId!, postId))
})

export const postHistoryRevisionHandler = apiHandler(async (ctx) => {
  const postId = Number(ctx.searchParams.get('post_id'))
  const historyId = Number(ctx.searchParams.get('history_id'))
  if (!postId || !historyId) return raw({ detail: 'Both post_id and history_id are required' }, 400)
  return raw(await blogService.getPostHistoryRevision(ctx.companyId!, postId, historyId))
})

export const focusKeywordsHandler = apiHandler(async (ctx) => raw(await blogService.listFocusKeywords(ctx.companyId!)))
export const codeClustersHandler = apiHandler(async (ctx) => raw(await blogService.getCodeClusterBlogPosts(ctx.companyId!)))

export const postElementsHandler = apiHandler(async (ctx) => {
  const postId = Number(ctx.params.postId)
  if (ctx.body) {
    const payload = validate(addElementSchema, { ...(ctx.body as Record<string, unknown>), blogPostId: postId })
    const created = await elementService.addElement(postId, ctx.companyId!, {
      elementType: payload.elementType,
      content: payload.content,
      order: payload.order,
    })
    return raw(created, 201)
  }

  return raw(await elementService.listElements(postId, ctx.companyId!))
})

export const elementByIdPutHandler = apiHandler(async (ctx) => {
  const elementId = Number(ctx.params.elementId)
  const payload = validate(updateElementSchema, ctx.body ?? {})
  return raw(await elementService.updateElement(elementId, ctx.companyId!, payload))
})

export const elementByIdDeleteHandler = apiHandler(async (ctx) => {
  await elementService.deleteElement(Number(ctx.params.elementId), ctx.companyId!)
  return raw({ deleted: true })
})

export const updateElementHandler = apiHandler(async (ctx) => {
  const elementId = Number(ctx.params.id)
  const existing = await prisma.blogPostElement.findFirst({ where: { id: elementId, blog_post: { companyId: ctx.companyId! } } })
  if (!existing) return raw({ detail: 'Blog post element not found.' }, 404)

  const payload = validate(updateElementSchema, ctx.body ?? {})
  return raw(serializeElement(await elementService.updateElement(elementId, ctx.companyId!, payload)))
})

export const deleteElementHandler = apiHandler(async (ctx) => {
  const blogPostId = Number(ctx.searchParams.get('blog_post_id'))
  const elementId = Number(ctx.searchParams.get('element_id'))
  if (!blogPostId || !elementId) return raw({ detail: 'Both blog_post_id and element_id are required.' }, 400)
  try {
    await elementService.deleteElementFromPost(ctx.companyId!, blogPostId, elementId)
  } catch (err) {
    if (err instanceof NotFoundError) return raw({ detail: 'Not found.' }, 404)
    throw err
  }
  return raw({ detail: 'Blog post element deleted successfully.' })
})

export const addElementHandler = apiHandler(async (ctx) => {
  const body = (ctx.body ?? {}) as Record<string, unknown>
  const blogPostId = Number(body.blog_post_id ?? body.blogPostId)
  const elementId = Number(body.element_id ?? body.elementId)
  const elementType = String(body.element_type ?? body.elementType ?? '')
  const generationNote = String(body.generation_note ?? body.generationNote ?? '')
  if (!blogPostId || !elementId || !elementType) {
    return raw({ detail: `blog_post_id, element_id, and element_type are required. Got: blog_post_id=${blogPostId}, element_id=${elementId}, element_type='${elementType}'` }, 400)
  }

  try {
    return raw(serializeElement(await elementService.addGeneratedElement(ctx.companyId!, { blogPostId, elementId, elementType, generationNote })), 201)
  } catch (err) {
    if (err instanceof ValidationError || err instanceof NotFoundError) {
      return raw({ detail: err.message }, err instanceof NotFoundError ? 404 : 400)
    }
    return raw({ detail: err instanceof Error ? err.message : 'Failed to add element' }, 500)
  }
})

export const regenerateElementHandler = apiHandler(async (ctx) => {
  const body = (ctx.body ?? {}) as Record<string, unknown>
  const blogPostId = Number(body.blog_post_id ?? body.blogPostId)
  const blogElementId = Number(body.blog_element_id ?? body.blogElementId)
  const regenerationNote = String(body.regeneration_note ?? body.regenerationNote ?? '')
  const newElementType = (body.new_element_type ?? body.newElementType) as string | undefined
  const newElementCount = Number(body.new_element_count ?? body.newElementCount ?? 1)

  if (newElementType && !(newElementType in BLOCK_SCHEMAS)) {
    return raw({ status: 'Failed to regenerate the blog element.', error: `Invalid element type: ${newElementType}. Must be one of: ${Object.keys(BLOCK_SCHEMAS).join(', ')}` }, 400)
  }

  const elements = await elementService.regenerateElementByContext(ctx.companyId!, {
    blogPostId,
    blogElementId,
    regenerationNote,
    newElementType,
    newElementCount,
  })

  return raw({ status: 'Blog element(s) regenerated successfully.', regenerated_elements: elements.map(serializeElement) })
})

export const enhanceElementHandler = apiHandler(async (ctx) => {
  const body = (ctx.body ?? {}) as Record<string, unknown>
  const updated = await elementService.enhanceElementByContext(
    ctx.companyId!,
    Number(body.blog_post_id ?? body.blogPostId),
    Number(body.blog_element_id ?? body.blogElementId),
  )
  return raw({ status: 'Blog element readability enhanced successfully.', enhanced_element: updated.content })
})

export const humanizeElementHandler = apiHandler(async (ctx) => {
  const body = (ctx.body ?? {}) as Record<string, unknown>
  const blogPostId = Number(body.blog_post_id ?? body.blogPostId)
  const blogElementId = Number(body.blog_element_id ?? body.blogElementId)
  if (!blogPostId || !blogElementId) return raw({ detail: 'blog_post_id and blog_element_id are required.' }, 400)

  const updated = await elementService.humanizeElementByContext(ctx.companyId!, blogPostId, blogElementId)
  return raw({
    id: updated.id,
    element_type: updated.element_type.toLowerCase(),
    order: updated.order,
    content: updated.content,
    created_at: updated.created_at,
  })
})

export const createTemplateHandler = apiHandler(async (ctx) => {
  const body = (ctx.body ?? {}) as Record<string, unknown>
  const name = body.name
  const elementType = body.element_type
  const structure = body.structure
  if (!name || !elementType || !structure) {
    return raw({ error: "Missing required fields: 'name', 'element_type', and 'structure' are required." }, 400)
  }

  try {
    const template = await elementService.createTemplate(String(name), String(elementType), structure)
    return raw({
      message: 'Blog element template created successfully',
      template: {
        id: template.id,
        name: template.name,
        element_type: template.element_type,
        structure: template.structure,
      },
    }, 201)
  } catch (e) {
    return raw({ error: `An unexpected error occurred: ${e instanceof Error ? e.message : String(e)}` }, 500)
  }
})

export const useTemplateHandler = apiHandler(async (ctx) => {
  const elementId = Number(ctx.searchParams.get('element_id'))
  const templateId = Number(ctx.searchParams.get('template_id'))
  if (!elementId || !templateId) return raw({ detail: 'Both element_id and template_id are required.' }, 400)

  try {
    const { element, next } = await elementService.applyTemplate(elementId, templateId)
    return raw({
      detail: 'Template applied successfully.',
      updated_element: {
        id: element.id,
        element_type: String(element.element_type).toLowerCase(),
        content: next,
        hyperlink: null,
      },
    })
  } catch (err) {
    if (err instanceof NotFoundError) return raw({ detail: err.message }, 404)
    throw err
  }
})

export const addCtaElementHandler = apiHandler(async (ctx) => {
  const body = (ctx.body ?? {}) as Record<string, unknown>
  const blogPostId = Number(body.blog_post_id ?? body.blogPostId)
  const elementId = Number(body.element_id ?? body.elementId)
  const ctaId = Number(body.cta_id ?? body.ctaId)
  if (!blogPostId || !elementId || !ctaId) return raw({ detail: 'blog_post_id, element_id, and cta_id are required' }, 400)

  try {
    const { created } = await elementService.addCtaElement(ctx.companyId!, blogPostId, elementId, ctaId)
    return raw(serializeElement(created), 201)
  } catch (err) {
    if (err instanceof NotFoundError) return raw({ detail: 'Not found.' }, 404)
    throw err
  }
})

export const generateImagesHandler = apiHandler(async (ctx) => {
  try { return raw(await imageService.generateImages(ctx.companyId!, ctx.body)) } catch (err) { return djangoDetailError(err) }
})
export const regenerateImageHandler = apiHandler(async (ctx) => {
  try { return raw(await imageService.regenerateImage(ctx.companyId!, ctx.body)) } catch (err) { return djangoDetailError(err) }
})
export const uploadImageHandler = apiHandler(async (ctx) => {
  try { return raw(await imageService.uploadImage(ctx.companyId!, ctx.body)) } catch (err) { return djangoDetailError(err) }
})
export const saveEditedImageHandler = apiHandler(async (ctx) => {
  try {
    return raw(await imageService.saveEditedImage(ctx.body))
  } catch (err) {
    if (err instanceof ValidationError) return raw({ error: err.message }, 400)
    if (err instanceof SyntaxError) return raw({ error: 'Invalid JSON data', details: err.message }, 400)
    if (err instanceof Error) return raw({ error: err.message }, 500)
    return raw({ error: 'Unknown error' }, 500)
  }
})

export const stockSearchHandler = apiHandler(async (ctx) => {
  const query = ctx.searchParams.get('query') ?? ''
  const page = Number(ctx.searchParams.get('page') ?? 1)
  const perPage = Number(ctx.searchParams.get('per_page') ?? 10)
  const orientation = (ctx.searchParams.get('orientation') ?? undefined) as 'landscape' | 'portrait' | 'square' | undefined
  const color = ctx.searchParams.get('color') ?? undefined
  try {
    return raw(await imageService.searchStockPhotos(ctx.companyId!, query, page, perPage, orientation, color))
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'Search query is required') return raw({ error: err.message }, 400)
      return raw({ error: err.message }, 500)
    }
    return raw({ error: 'An unexpected error occurred' }, 500)
  }
})

export const stockUseHandler = apiHandler(async (ctx) => {
  try { return raw(await imageService.useStockPhoto(ctx.companyId!, ctx.body)) } catch (err) { return djangoDetailError(err) }
})

const applyImageSchema = z
  .object({
    post_id: z.number().int().positive().optional(),
    blog_post_id: z.number().int().positive().optional(),
    image_number: z.number().int().nonnegative(),
    image_url: z.string().url(),
  })
  .refine(
    (b) => b.post_id != null || b.blog_post_id != null,
    { message: 'post_id or blog_post_id is required' },
  )
  .refine(
    (b) => b.post_id == null || b.blog_post_id == null || b.post_id === b.blog_post_id,
    { message: 'post_id and blog_post_id disagree' },
  )

export const applyImageHandler = apiHandler(async (ctx) => {
  try {
    const parsed = validate(applyImageSchema, ctx.body)
    const normalized = {
      post_id: parsed.post_id ?? parsed.blog_post_id!,
      image_number: parsed.image_number,
      image_url: parsed.image_url,
    }
    return raw(await imageService.useStockPhoto(ctx.companyId!, normalized))
  } catch (err) {
    return djangoDetailError(err)
  }
})

export const quilloAnalyzeHandler = apiHandler(async (ctx) => {
  const body = (ctx.body ?? {}) as Record<string, unknown>
  const blogPostId = Number(body.blog_post_id)
  if (!blogPostId) return raw({ error: 'blog_post_id is required' }, 400)
  return raw(await quilloService.analyzePost(ctx.companyId!, blogPostId))
})

export const quilloChatHandler = apiHandler(async (ctx) => {
  const body = (ctx.body ?? {}) as Record<string, unknown>
  const blogPostId = Number(body.blog_post_id)
  const question = String(body.question ?? '').trim()
  if (!blogPostId || !question) return raw({ error: 'blog_post_id and question are required' }, 400)
  return raw(await quilloService.chat(ctx.companyId!, body))
})

export const quilloFacebookHandler = apiHandler(async (ctx) => {
  const body = (ctx.body ?? {}) as Record<string, unknown>
  const blogPostId = Number(body.blog_post_id)
  if (!blogPostId) return raw({ error: 'blog_post_id is required' }, 400)
  return raw(await quilloService.generateFacebookPost(ctx.companyId!, blogPostId))
})

export const quilloAutopilotHandler = apiHandler(async (ctx) => {
  const body = (ctx.body ?? {}) as Record<string, unknown>
  const blogPostId = Number(body.blog_post_id)
  if (!blogPostId) return raw({ detail: "'blog_post_id' is required in the request body." }, 400)
  return raw(await quilloService.runAutopilot(ctx.companyId!, blogPostId), 202)
})

export const quilloAutopilotStatusHandler = apiHandler(async (ctx) => {
  const taskId = String(ctx.params.taskId ?? '')
  if (!taskId) {
    return raw({ detail: 'taskId is required' }, 400)
  }

  const task = getTask(taskId)
  if (!task) {
    return raw({
      task_id: taskId,
      status: 'not_available',
      detail: 'Task not found or expired',
      logs: [],
    }, 404)
  }

  return raw({
    task_id: task.id,
    status: task.status,
    logs: task.logs,
    error: task.error ?? null,
  })
})

export const companyQuilloHandler = apiHandler(async (ctx) => raw(await quilloService.getCompanyAnalysis(ctx.companyId!)))
export const companyQuilloAnalyzeHandler = apiHandler(async (ctx) => raw(await quilloService.analyzeCompany(ctx.companyId!)))
