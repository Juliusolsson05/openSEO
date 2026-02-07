import { apiHandler } from '@/server/api/handler'
import { NotFoundError } from '@/server/api/errors'
import { error, success } from '@/server/api/response'
import { validate } from '@/server/api/validate'
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

async function handleAurora(ctx: {
  companyId: number | null
  body: unknown
  params: Record<string, unknown>
  searchParams: URLSearchParams
}) {
  if (!ctx.companyId) throw new NotFoundError('Missing company context')

  const slug = getSlugParts(ctx.params)
  const path = slug.join('/')

  // BLOG POSTS
  if (path === 'blog/posts') {
    const query = validate(listBlogPostsQuerySchema, Object.fromEntries(ctx.searchParams))
    const result = await blogService.listPosts(ctx.companyId, query)
    return success(result)
  }

  if (path === 'blog/posts/update') {
    const body = (ctx.body ?? {}) as Record<string, unknown>
    const id = Number(body.id ?? body.postId)
    const payload = validate(updateBlogPostSchema, body)
    const post = await blogService.updatePost(id, ctx.companyId, payload)
    return success(post)
  }

  if (path === 'blog/posts/generate') {
    return methodNotImplemented(path)
  }

  if (path === 'blog/posts/regenerate') {
    return methodNotImplemented(path)
  }

  if (path.match(/^blog\/posts\/delete\/\d+$/)) {
    const postId = Number(slug[3])
    await blogService.deletePost(postId, ctx.companyId)
    return success({ deleted: true })
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
      return success(created, 201)
    }

    const elements = await elementService.listElements(postId, ctx.companyId)
    return success(elements)
  }

  if (path.match(/^blog\/elements\/\d+$/)) {
    const elementId = Number(slug[2])

    if (ctx.body && (ctx.body as Record<string, unknown>).delete === true) {
      await elementService.deleteElement(elementId, ctx.companyId)
      return success({ deleted: true })
    }

    const payload = validate(updateElementSchema, ctx.body ?? {})
    const updated = await elementService.updateElement(elementId, ctx.companyId, payload)
    return success(updated)
  }

  if (path.match(/^blog\/posts\/update-element\/\d+$/)) {
    const elementId = Number(slug[3])
    const payload = validate(updateElementSchema, ctx.body ?? {})
    const updated = await elementService.updateElement(elementId, ctx.companyId, payload)
    return success(updated)
  }

  if (path === 'blog/posts/delete-element') {
    const body = (ctx.body ?? {}) as Record<string, unknown>
    const elementId = Number(body.elementId ?? body.id)
    await elementService.deleteElement(elementId, ctx.companyId)
    return success({ deleted: true })
  }

  // TITLES
  if (path === 'blog/titles') {
    const query = validate(listTitlesQuerySchema, Object.fromEntries(ctx.searchParams))
    const data = await titleService.listTitles(ctx.companyId, query)
    return success(data)
  }

  if (path === 'blog/titles/generate') {
    return methodNotImplemented(path)
  }

  if (path.match(/^blog\/titles\/update\/\d+$/)) {
    const titleId = Number(slug[3])
    const payload = validate(updateTitleSchema, ctx.body ?? {})
    const updated = await titleService.updateTitle(titleId, ctx.companyId, payload)
    return success(updated)
  }

  if (path.match(/^blog\/titles\/delete\/\d+$/)) {
    const titleId = Number(slug[3])
    await titleService.deleteTitle(titleId, ctx.companyId)
    return success({ deleted: true })
  }

  if (path.match(/^blog\/titles\/regenerate\/\d+$/)) {
    return methodNotImplemented(path)
  }

  // CATEGORIES
  if (path === 'blog/titles/categories') {
    if (ctx.body) {
      const payload = validate(addCategoriesSchema, ctx.body)
      const created = await categoryService.addCategories(ctx.companyId, payload.names)
      return success(created, 201)
    }

    const categories = await categoryService.listCategories(ctx.companyId)
    return success(categories)
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
    return success(created, 201)
  }

  if (path === 'blog/titles/categories/bulk-delete') {
    const payload = validate(bulkDeleteCategoriesSchema, ctx.body ?? {})
    await categoryService.bulkDeleteCategories(payload.ids, ctx.companyId)
    return success({ deleted: true, ids: payload.ids })
  }

  if (path.match(/^blog\/titles\/categories\/edit\/\d+$/)) {
    const categoryId = Number(slug[4])
    const payload = validate(updateCategorySchema, ctx.body ?? {})
    const updated = await categoryService.editCategory(categoryId, ctx.companyId, payload)
    return success(updated)
  }

  if (path.match(/^blog\/titles\/categories\/delete\/\d+$/)) {
    const categoryId = Number(slug[4])
    await categoryService.deleteCategory(categoryId, ctx.companyId)
    return success({ deleted: true })
  }

  // SCHEDULE
  if (path === 'blog/schedule/bulk') {
    if (ctx.body) {
      const payload = validate(createBulkScheduleSchema, ctx.body)
      const created = await scheduleService.createBulkSchedule(ctx.companyId, payload)
      return success(created, 201)
    }

    const schedules = await scheduleService.listSchedules(ctx.companyId)
    return success(schedules)
  }

  if (path === 'blog/schedule/bulk/create') {
    const payload = validate(createBulkScheduleSchema, ctx.body ?? {})
    const created = await scheduleService.createBulkSchedule(ctx.companyId, payload)
    return success(created, 201)
  }

  if (path.match(/^blog\/schedule\/bulk\/update\/\d+$/)) {
    const bulkScheduleId = Number(slug[4])
    const payload = validate(updateBulkScheduleSchema, ctx.body ?? {})
    const updated = await scheduleService.updateBulkSchedule(ctx.companyId, bulkScheduleId, payload)
    return success(updated)
  }

  if (path === 'blog/schedule/bulk/assign') {
    const payload = validate(assignToBulkSchema, ctx.body ?? {})
    const result = await scheduleService.assignToBulk(ctx.companyId, payload.titleIds, payload.bulkScheduleId)
    return success(result)
  }

  if (path === 'blog/schedule/bulk/remove') {
    const payload = validate(removeFromBulkSchema, ctx.body ?? {})
    const result = await scheduleService.removeFromBulk(ctx.companyId, payload.titleIds)
    return success(result)
  }

  if (path.match(/^blog\/schedule\/post\/\d+$/)) {
    const postId = Number(slug[3])
    const payload = validate(schedulePostSchema, ctx.body ?? {})
    const result = await scheduleService.schedulePost(ctx.companyId, postId, payload.date)
    return success(result)
  }

  if (path.match(/^blog\/schedule\/reschedule\/\d+$/)) {
    const postId = Number(slug[3])
    const payload = validate(schedulePostSchema, ctx.body ?? {})
    const result = await scheduleService.reschedulePost(ctx.companyId, postId, payload.date)
    return success(result)
  }

  if (path === 'blog/schedule/interval') {
    const payload = validate(scheduleByIntervalSchema, ctx.body ?? {})
    const result = await scheduleService.scheduleByInterval(
      ctx.companyId,
      payload.titleIds,
      payload.startDate,
      payload.intervalDays,
    )
    return success(result)
  }

  // CTA + CAMPAIGNS
  if (path === 'blog/cta/list') {
    const ctas = await ctaService.listCtas(ctx.companyId)
    return success(ctas)
  }

  if (path === 'blog/cta/create') {
    const payload = validate(createCtaSchema, ctx.body ?? {})
    const created = await ctaService.createCta(ctx.companyId, payload)
    return success(created, 201)
  }

  if (path.match(/^blog\/cta\/edit\/\d+$/)) {
    const ctaId = Number(slug[3])
    const payload = validate(updateCtaSchema, ctx.body ?? {})
    const updated = await ctaService.updateCta(ctx.companyId, ctaId, payload)
    return success(updated)
  }

  if (path.match(/^blog\/cta\/delete\/\d+$/)) {
    const ctaId = Number(slug[3])
    await ctaService.deleteCta(ctx.companyId, ctaId)
    return success({ deleted: true })
  }

  if (path === 'blog/cta/campaign/create') {
    const payload = validate(createCampaignSchema, ctx.body ?? {})
    const created = await ctaService.createCampaign(ctx.companyId, payload)
    return success(created, 201)
  }

  if (path.match(/^blog\/cta\/campaign\/edit\/\d+$/)) {
    const campaignId = Number(slug[4])
    const payload = validate(updateCampaignSchema, ctx.body ?? {})
    const updated = await ctaService.updateCampaign(ctx.companyId, campaignId, payload)
    return success(updated)
  }

  if (path.match(/^blog\/cta\/campaign\/delete\/\d+$/)) {
    const campaignId = Number(slug[4])
    await ctaService.deleteCampaign(ctx.companyId, campaignId)
    return success({ deleted: true })
  }

  // DICTIONARY
  if (path === 'dictionary/dictionaries') {
    const dictionaries = await dictionaryService.listDictionaries(ctx.companyId)
    return success(dictionaries)
  }

  if (path.match(/^dictionary\/dictionary\/\d+$/)) {
    const dictionaryId = Number(slug[2])

    if (ctx.body) {
      const payload = validate(updateDictionarySchema, ctx.body)
      const updated = await dictionaryService.modifyDictionary(dictionaryId, ctx.companyId, payload)
      return success(updated)
    }

    const dictionary = await dictionaryService.getDictionary(dictionaryId, ctx.companyId)
    return success(dictionary)
  }

  if (path.match(/^dictionary\/modify\/\d+$/)) {
    const dictionaryId = Number(slug[2])
    const payload = validate(updateDictionarySchema, ctx.body ?? {})
    const updated = await dictionaryService.modifyDictionary(dictionaryId, ctx.companyId, payload)
    return success(updated)
  }

  if (path.match(/^dictionary\/modify\/word\/\d+$/)) {
    const wordId = Number(slug[3])
    const payload = validate(updateWordSchema, ctx.body ?? {})
    const updated = await dictionaryService.modifyWord(wordId, ctx.companyId, payload)
    return success(updated)
  }

  if (path.match(/^dictionary\/dictionary\/\d+\/word\/\d+$/)) {
    const dictionaryId = Number(slug[2])
    const wordId = Number(slug[4])
    const word = await dictionaryService.getWord(dictionaryId, wordId, ctx.companyId)
    return success(word)
  }

  if (path === 'dictionary/dictionary/words/delete') {
    const payload = validate(deleteWordsSchema, ctx.body ?? {})
    const result = await dictionaryService.deleteWords(payload, ctx.companyId)
    return success(result)
  }

  // ANALYTICS
  if (path === 'analytics/blog/readability') {
    const data = await analyticsService.getReadabilityAnalytics(ctx.companyId)
    return success(data)
  }

  if (path === 'analytics/blog/general') {
    const data = await analyticsService.getGeneralAnalytics(ctx.companyId)
    return success(data)
  }

  if (path === 'analytics/blog/meta') {
    const data = await analyticsService.getMetaAnalytics(ctx.companyId)
    return success(data)
  }

  if (path === 'analytics/blog/elements') {
    const data = await analyticsService.getElementAnalytics(ctx.companyId)
    return success(data)
  }

  if (path === 'analytics/dictionary/general') {
    const data = await analyticsService.getDictionaryAnalytics(ctx.companyId)
    return success(data)
  }

  // FALLBACK
  return methodNotImplemented(path)
}

const routeHandler = apiHandler(async (ctx) => handleAurora(ctx as any))

export const GET = routeHandler
export const POST = routeHandler
export const PUT = routeHandler
export const DELETE = routeHandler
