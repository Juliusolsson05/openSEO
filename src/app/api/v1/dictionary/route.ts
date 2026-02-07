import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { success } from '@/server/api/response'
import { dictionaryService } from '@/server/services/dictionary.service'

export const GET = apiHandler(async ({ companyId }) => {
  if (!companyId) {
    throw new ValidationError('Missing company ID in session')
  }

  const dictionaries = await dictionaryService.listDictionaries(companyId)
  return success(dictionaries)
})
