import { ValidationError } from '@/server/api/errors'
import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { dictionaryService } from '@/server/services/dictionary.service'

const handler = apiHandler(async (ctx) => {
  const body = (ctx.body ?? {}) as Record<string, unknown>
  const dictionaryId = Number(body.dictionary_id ?? 0)
  const word = String(body.word ?? '').trim().toLowerCase()
  if (!dictionaryId) throw new ValidationError('dictionary_id is required')
  if (!word) throw new ValidationError('word is required')
  const result = await dictionaryService.exportWord(ctx.companyId!, dictionaryId, word)
  if ('detail' in (result as any)) return raw(result, 404)
  return raw(result)
})

export const POST = handler
