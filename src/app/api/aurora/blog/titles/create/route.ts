import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { titleService } from '@/server/services/title.service'
import { createTitleSchema } from '@/server/validators/title.validators'

const handler = apiHandler(async (ctx) => {
  const body = (ctx.body ?? {}) as Record<string, unknown>
  const payload = validate(createTitleSchema, {
    titleText: body.title_text ?? body.titleText,
    seoTitle: body.seo_title ?? body.seoTitle,
    focusKeyword: body.focus_keyword ?? body.focusKeyword,
    categoryIds: body.category_ids ?? body.categoryIds,
  })

  const created = await titleService.createTitle(ctx.companyId!, payload)
  return raw(created, 201)
})

export const POST = handler
