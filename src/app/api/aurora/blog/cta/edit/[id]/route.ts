import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { ctaService } from '@/server/services/cta.service'
import { updateCtaSchema } from '@/server/validators/cta.validators'

const handler = apiHandler(async (ctx) => {
  const ctaId = Number(ctx.params.id)
  const payload = validate(updateCtaSchema, ctx.body ?? {})
  const updated = await ctaService.updateCta(ctx.companyId!, ctaId, payload)
  return raw(updated)
})

export const PUT = handler
export const PATCH = handler
