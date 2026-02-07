import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { ctaService } from '@/server/services/cta.service'

const handler = apiHandler(async (ctx) => {
  const ctaId = Number(ctx.params.id)
  await ctaService.deleteCta(ctx.companyId!, ctaId)
  return raw({ deleted: true })
})

export const DELETE = handler
