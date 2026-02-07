import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { ctaService } from '@/server/services/cta.service'
import { updateCampaignSchema } from '@/server/validators/cta.validators'

const handler = apiHandler(async (ctx) => {
  const campaignId = Number(ctx.params.id)
  const payload = validate(updateCampaignSchema, ctx.body ?? {})
  const updated = await ctaService.updateCampaign(ctx.companyId!, campaignId, payload)
  return raw(updated)
})

export const PUT = handler
export const PATCH = handler
