import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { dictionaryService } from '@/server/services/dictionary.service'
import { validate } from '@/server/api/validate'
import { deleteWordsSchema } from '@/server/validators/dictionary.validators'

const handler = apiHandler(async (ctx) => {
  const body = (ctx.body ?? {}) as Record<string, unknown>
  const payload = validate(deleteWordsSchema, {
    dictionaryId: Number(body.dictionary_id),
    ids: Array.isArray(body.word_ids) ? body.word_ids.map((id) => Number(id)) : [],
  })
  const result = await dictionaryService.deleteWords(payload, ctx.companyId!)
  return raw(result)
})

export const POST = handler
