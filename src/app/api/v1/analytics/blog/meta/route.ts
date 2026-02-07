import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { success } from '@/server/api/response'
import { analyticsService } from '@/server/services/analytics.service'

export const GET = apiHandler(async ({ companyId }) => {
  if (!companyId) {
    throw new ValidationError('Missing company ID in session')
  }

  const data = await analyticsService.getMetaAnalytics(companyId)
  return success(data)
})
