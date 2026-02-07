import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { ctaService } from '@/server/services/cta.service'
import { createCtaSchema } from '@/server/validators/cta.validators'

const handler = apiHandler(async (ctx) => {
  const payload = validate(createCtaSchema, ctx.body ?? {})
  const created = await ctaService.createCta(ctx.companyId!, payload)
  return raw(created, 201)
})

export const POST = handler
