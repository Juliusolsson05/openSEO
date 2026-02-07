import { apiHandler } from '@/server/api/handler'
import { NotFoundError } from '@/server/api/errors'
import { error, raw } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { prisma } from '@/lib/prisma'
import { analyticsService } from '@/server/services/analytics.service'
import { blogService } from '@/server/services/blog.service'
import { categoryService } from '@/server/services/category.service'
import { ctaService } from '@/server/services/cta.service'
import { dictionaryService } from '@/server/services/dictionary.service'
import { elementService } from '@/server/services/element.service'
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

function getSlugParts(params: Record<string, unknown>): string[] {
  const raw = params.slug
  if (Array.isArray(raw)) return raw.map(String)
  if (typeof raw === 'string') return raw.split('/').filter(Boolean)
  return []
}

function methodNotImplemented(path: string) {
  return error(`Endpoint not implemented yet: /api/aurora/${path}`, 501)
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
}) {
  const slug = getSlugParts(ctx.params)
  const path = slug.join('/')

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
    const body = (ctx.body ?? {}) as Record<string, unknown>
    const postId = Number(body.post_id ?? body.postId)
    if (!postId) return raw({ detail: 'post_id is required' }, 400)

    const payload = validate(updateBlogPostSchema, body)
    const post = await blogService.updatePost(postId, ctx.companyId, payload)
    return raw(post)
  }

  if (path === 'blog/posts/generate') {
    return aiNotMigrated()
  }

  if (path === 'blog/posts/regenerate') {
    return aiNotMigrated()
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
  if (path === 'blog/posts/share') return notImplementedYet()
  if (path === 'blog/posts/sync/recommended') return aiNotMigrated()
  if (path === 'blog/posts/sync/keywords') return aiNotMigrated()
  if (path === 'blog/posts/upload') return notImplementedYet()
  if (path === 'blog/posts/upload/all') return notImplementedYet()
  if (path === 'blog/posts/export') return notImplementedYet()
  if (path === 'blog/posts/export/all') return notImplementedYet()
  if (path === 'blog/posts/export/third-party') return notImplementedYet()
  if (path === 'blog/posts/elements/get/code-clusters') return notImplementedYet()

  // BLOG HISTORY
  if (path === 'blog/posts/history') return notImplementedYet()
  if (path === 'blog/posts/history/revision') return notImplementedYet()

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
  if (path === 'blog/posts/elements/template/create') return notImplementedYet()
  if (path === 'blog/posts/elements/template/use') return notImplementedYet()
  if (path === 'blog/posts/elements/regenerate') return aiNotMigrated()
  if (path === 'blog/posts/elements/add') return aiNotMigrated()
  if (path === 'blog/posts/elements/enhance') return aiNotMigrated()
  if (path === 'blog/posts/elements/humanize') return aiNotMigrated()
  if (path === 'blog/posts/elements/add-cta') return notImplementedYet()

  // TITLES
  if (path === 'blog/titles') {
    const query = validate(listTitlesQuerySchema, Object.fromEntries(ctx.searchParams))
    const data = await titleService.listTitles(ctx.companyId, query)
    return raw(data.items)
  }

  if (path === 'blog/titles/generate') {
    return aiNotMigrated()
  }

  if (path.match(/^blog\/titles\/update\/\d+$/)) {
    const titleId = Number(slug[3])
    const payload = validate(updateTitleSchema, ctx.body ?? {})
    const updated = await titleService.updateTitle(titleId, ctx.companyId, payload)
    return raw(updated)
  }

  if (path.match(/^blog\/titles\/delete\/\d+$/)) {
    const titleId = Number(slug[3])
    await titleService.deleteTitle(titleId, ctx.companyId)
    return raw({ deleted: true })
  }

  if (path.match(/^blog\/titles\/regenerate\/\d+$/)) {
    return aiNotMigrated()
  }

  if (path === 'blog/titles/categories/generate') {
    return aiNotMigrated()
  }

  if (path === 'blog/titles/categories/categorize') {
    return aiNotMigrated()
  }

  // CATEGORIES
  if (path === 'blog/titles/categories' || path === 'blog/categories') {
    if (ctx.body) {
      const payload = validate(addCategoriesSchema, ctx.body)
      const created = await categoryService.addCategories(ctx.companyId, payload.names)
      return raw(created, 201)
    }

    const categories = await categoryService.listCategories(ctx.companyId)
    return raw(categories.map(({ id, name }) => ({ id, name })))
  }

  if (path === 'blog/titles/categories/add') {
    const body = ctx.body as Record<string, unknown>
    const names = Array.isArray(body?.names)
      ? body.names
      : typeof body?.name === 'string'
        ? [body.name]
        : []
    const payload = validate(addCategoriesSchema, { names })
    const created = await categoryService.addCategories(ctx.companyId, payload.names)
    return raw(created, 201)
  }

  if (path === 'blog/titles/categories/bulk-delete') {
    const payload = validate(bulkDeleteCategoriesSchema, ctx.body ?? {})
    await categoryService.bulkDeleteCategories(payload.ids, ctx.companyId)
    return raw({ deleted: true, ids: payload.ids })
  }

  if (path.match(/^blog\/titles\/categories\/edit\/\d+$/)) {
    const categoryId = Number(slug[4])
    const payload = validate(updateCategorySchema, ctx.body ?? {})
    const updated = await categoryService.editCategory(categoryId, ctx.companyId, payload)
    return raw(updated)
  }

  if (path.match(/^blog\/titles\/categories\/delete\/\d+$/)) {
    const categoryId = Number(slug[4])
    await categoryService.deleteCategory(categoryId, ctx.companyId)
    return raw({ deleted: true })
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
  if (path === 'blog/images/generate') return aiNotMigrated()
  if (path === 'blog/images/regenerate') return aiNotMigrated()

  if (path === 'blog/images/save/edit') return notImplementedYet()
  if (path === 'blog/images/upload') return notImplementedYet()
  if (path === 'blog/images/stock_photos/search') return notImplementedYet()
  if (path === 'blog/images/stock_photos/use') return notImplementedYet()

  // QUILLO AI
  if (path === 'blog/quillo/analyze') return aiNotMigrated()
  if (path === 'blog/quillo/analyze/chat') return aiNotMigrated()
  if (path === 'blog/quillo/post/facebook') return aiNotMigrated()
  if (path === 'blog/quillo/post/autopilot') return aiNotMigrated()

  if (path.match(/^blog\/quillo\/post\/autopilot-status\/[^/]+$/)) {
    const taskId = slug[4]
    return taskNotMigrated(taskId)
  }

  if (path === 'company/quillo') return notImplementedYet()
  if (path === 'company/quillo/analyze') return aiNotMigrated()

  // DICTIONARY
  if (path === 'dictionary/dictionaries') {
    const dictionaries = await dictionaryService.listDictionaries(ctx.companyId)
    return raw(dictionaries)
  }

  if (path.match(/^dictionary\/dictionary\/\d+$/)) {
    const dictionaryId = Number(slug[2])

    if (ctx.body) {
      const payload = validate(updateDictionarySchema, ctx.body)
      const updated = await dictionaryService.modifyDictionary(dictionaryId, ctx.companyId, payload)
      return raw(updated)
    }

    const dictionary = await dictionaryService.getDictionary(dictionaryId, ctx.companyId)
    return raw(dictionary)
  }

  if (path.match(/^dictionary\/modify\/\d+$/)) {
    const dictionaryId = Number(slug[2])
    const payload = validate(updateDictionarySchema, ctx.body ?? {})
    const updated = await dictionaryService.modifyDictionary(dictionaryId, ctx.companyId, payload)
    return raw(updated)
  }

  if (path.match(/^dictionary\/modify\/word\/\d+$/)) {
    const wordId = Number(slug[3])
    const payload = validate(updateWordSchema, ctx.body ?? {})
    const updated = await dictionaryService.modifyWord(wordId, ctx.companyId, payload)
    return raw(updated)
  }

  if (path.match(/^dictionary\/dictionary\/\d+\/word\/\d+$/)) {
    const dictionaryId = Number(slug[2])
    const wordId = Number(slug[4])
    const word = await dictionaryService.getWord(dictionaryId, wordId, ctx.companyId)
    return raw(word)
  }

  if (path === 'dictionary/dictionary/words/delete') {
    const payload = validate(deleteWordsSchema, ctx.body ?? {})
    const result = await dictionaryService.deleteWords(payload, ctx.companyId)
    return raw(result)
  }

  if (path === 'dictionary/generation/keywords/start') return aiNotMigrated()
  if (path === 'dictionary/generation/keywords/review') return aiNotMigrated()
  if (path === 'dictionary/generation/keywords/end') return aiNotMigrated()
  if (path === 'dictionary/generation/definition/generate') return aiNotMigrated()
  if (path === 'dictionary/generation/keyword/new') return aiNotMigrated()
  if (path === 'dictionary/generation/definition/new') return aiNotMigrated()

  if (path === 'dictionary/dictionary/upload') return notImplementedYet()
  if (path === 'dictionary/dictionary/upload/all') return notImplementedYet()

  if (path === 'dictionary/dictionary/export') return notImplementedYet()
  if (path === 'dictionary/dictionary/export/all') return notImplementedYet()

  if (path.startsWith('dictionary/dictionary/export/third-party')) {
    return notImplementedYet()
  }

  // PRODUCTS
  if (path === 'ecommerce/products/import') return notImplementedYet()
  if (path === 'ecommerce/blog/populate-product-recommendations') return aiNotMigrated()

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

const routeHandler = apiHandler(async (ctx) => handleAurora(ctx as any))

export const GET = routeHandler
export const POST = routeHandler
export const PUT = routeHandler
export const DELETE = routeHandler
