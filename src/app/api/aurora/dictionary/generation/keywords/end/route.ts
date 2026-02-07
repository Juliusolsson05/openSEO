import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { dictionaryService } from '@/server/services/dictionary.service'
import { toDjangoDictionaryStatus } from '@/server/utils/dictionary'

const handler = apiHandler(async (ctx) => {
  const result = await dictionaryService.completeKeywordGeneration(ctx.companyId!, ctx.body)
  return raw({ ...result, status: toDjangoDictionaryStatus(String((result as any).status)) })
})
export const POST = handler
