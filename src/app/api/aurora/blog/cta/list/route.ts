import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { ctaService } from '@/server/services/cta.service'

const handler = apiHandler(async (ctx) => {
  const ctas = await ctaService.listCtas(ctx.companyId!)
  return raw(ctas)
})

export const GET = handler
