import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { success } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { dictionaryService } from '@/server/services/dictionary.service'
import { updateWordSchema } from '@/server/validators/dictionary.validators'
import { z } from 'zod'

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
  wordId: z.coerce.number().int().positive(),
})

export const GET = apiHandler(async ({ companyId, params }) => {
  if (!companyId) {
    throw new ValidationError('Missing company ID in session')
  }

  const { id, wordId } = validate(paramsSchema, params)
  const word = await dictionaryService.getWord(id, wordId, companyId)

  return success(word)
})

export const PUT = apiHandler(async ({ companyId, params, body }) => {
  if (!companyId) {
    throw new ValidationError('Missing company ID in session')
  }

  const { id, wordId } = validate(paramsSchema, params)
  const payload = validate(updateWordSchema, { ...(typeof body === 'object' && body ? body : {}), dictionaryId: id })

  const updated = await dictionaryService.modifyWord(wordId, companyId, payload)
  return success(updated)
})
