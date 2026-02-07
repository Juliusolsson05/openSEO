import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { dictionaryService } from '@/server/services/dictionary.service'

const handler = apiHandler(async (ctx, req) => {
  const dictionaryId = Number(ctx.params.id)
  if (req.method === 'DELETE') {
    await dictionaryService.deleteDictionary(dictionaryId, ctx.companyId!)
    return raw(null, 204)
  }

  const body = (ctx.body ?? {}) as Record<string, unknown>
  const result = await dictionaryService.modifyDictionaryDetail(dictionaryId, ctx.companyId!, {
    ...(body.title !== undefined ? { title: String(body.title) } : {}),
    ...(body.subject !== undefined ? { subject: String(body.subject) } : {}),
    ...(body.language !== undefined ? { language: String(body.language) } : {}),
    ...(body.num_words !== undefined ? { num_words: Number(body.num_words) } : {}),
  })
  return raw(result)
})

export const PUT = handler
export const DELETE = handler
