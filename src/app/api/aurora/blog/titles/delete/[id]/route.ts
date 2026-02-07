import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { titleService } from '@/server/services/title.service'

const handler = apiHandler(async (ctx) => {
  const titleId = Number(ctx.params.id)
  await titleService.deleteTitle(titleId, ctx.companyId!)
  return raw({ message: 'Title deleted successfully' })
})

export const DELETE = handler
