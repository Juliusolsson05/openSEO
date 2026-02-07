import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { success } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { dictionaryService } from '@/server/services/dictionary.service'
import { idParamSchema } from '@/server/validators/common.validators'
import { updateDictionarySchema } from '@/server/validators/dictionary.validators'

export const GET = apiHandler(async ({ companyId, params }) => {
  if (!companyId) {
    throw new ValidationError('Missing company ID in session')
  }

  const { id } = validate(idParamSchema, params)
  const dictionary = await dictionaryService.getDictionary(id, companyId)

  return success(dictionary)
})

export const PUT = apiHandler(async ({ companyId, params, body }) => {
  if (!companyId) {
    throw new ValidationError('Missing company ID in session')
  }

  const { id } = validate(idParamSchema, params)
  const payload = validate(updateDictionarySchema, body)

  const updated = await dictionaryService.modifyDictionary(id, companyId, payload)
  return success(updated)
})
