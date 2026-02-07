import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { ctaService } from '@/server/services/cta.service'

const handler = apiHandler(async (ctx) => {
  const campaignId = Number(ctx.params.id)
  await ctaService.deleteCampaign(ctx.companyId!, campaignId)
  return raw({ deleted: true })
})

export const DELETE = handler
