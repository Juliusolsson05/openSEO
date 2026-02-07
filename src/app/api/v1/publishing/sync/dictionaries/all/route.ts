import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { success } from '@/server/api/response'
import { publishingSyncService } from '@/server/services/publishing-sync.service'

export const POST = apiHandler(async ({ companyId }) => {
  if (!companyId) throw new ValidationError('Missing company ID in session')
  const result = await publishingSyncService.pushAllDictionaries(companyId)
  return success(result, 202)
})
