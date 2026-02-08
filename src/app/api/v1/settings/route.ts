import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { success } from '@/server/api/response'
import { settingsService } from '@/server/services/settings.service'

export const GET = apiHandler(async ({ companyId }) => {
  if (!companyId) throw new ValidationError('Missing company ID in session')
  const snapshot = await settingsService.getSnapshot(companyId)
  return success(snapshot)
})
