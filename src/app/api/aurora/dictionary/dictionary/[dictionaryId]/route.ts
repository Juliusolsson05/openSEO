import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { dictionaryService } from '@/server/services/dictionary.service'

const handler = apiHandler(async (ctx) => {
  const dictionaryId = Number(ctx.params.dictionaryId)
  const result = await dictionaryService.getDictionaryDetail(dictionaryId, ctx.companyId!)
  return raw(result)
})

export const GET = handler
