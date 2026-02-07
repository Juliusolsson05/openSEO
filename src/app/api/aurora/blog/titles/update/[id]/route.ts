import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { titleService } from '@/server/services/title.service'
import { updateTitleSchema } from '@/server/validators/title.validators'

const handler = apiHandler(async (ctx) => {
  const titleId = Number(ctx.params.id)
  const body = (ctx.body ?? {}) as Record<string, unknown>
  const payload = validate(updateTitleSchema, {
    titleText: body.title_text ?? body.titleText,
    seoTitle: body.seo_title ?? body.seoTitle,
    focusKeyword: body.focus_keyword ?? body.focusKeyword,
    status: body.status,
    categoryIds: body.category_ids ?? body.categoryIds,
  })
  const updated = await titleService.updateTitle(titleId, ctx.companyId!, payload)
  return raw(updated)
})

export const PUT = handler
export const PATCH = handler
