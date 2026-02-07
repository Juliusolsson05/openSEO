import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { titleService } from '@/server/services/title.service'

const handler = apiHandler(async (ctx) => {
  const titleId = Number(ctx.params.id)
  const regenerated = await titleService.regenerateTitle(ctx.companyId!, titleId)
  return raw(regenerated)
})

export const POST = handler
