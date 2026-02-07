import { ValidationError } from '@/server/api/errors'
import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { dictionaryService } from '@/server/services/dictionary.service'

const handler = apiHandler(async (ctx) => {
  const body = (ctx.body ?? {}) as Record<string, unknown>
  const dictionaryId = Number(body.dictionary_id ?? 0)
  if (!dictionaryId) throw new ValidationError('dictionary_id is required')
  return raw(await dictionaryService.exportAll(ctx.companyId!, dictionaryId))
})

export const POST = handler
