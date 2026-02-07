import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { success } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { dictionaryService } from '@/server/services/dictionary.service'
import { deleteWordsSchema } from '@/server/validators/dictionary.validators'

export const POST = apiHandler(async ({ companyId, body }) => {
  if (!companyId) {
    throw new ValidationError('Missing company ID in session')
  }

  const payload = validate(deleteWordsSchema, body)
  const result = await dictionaryService.deleteWords(payload, companyId)

  return success(result)
})
