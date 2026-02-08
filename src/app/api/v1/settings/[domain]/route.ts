import { z } from 'zod'

import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { success } from '@/server/api/response'
import { settingsDomainSchema, settingsService } from '@/server/services/settings.service'

const paramsSchema = z.object({
  domain: settingsDomainSchema,
})

export const GET = apiHandler(async ({ companyId, params }) => {
  if (!companyId) throw new ValidationError('Missing company ID in session')

  const parsed = paramsSchema.safeParse(params)
  if (!parsed.success) throw new ValidationError('Invalid settings domain')

  const result = await settingsService.getDomain(companyId, parsed.data.domain)
  return success(result)
})

export const PATCH = apiHandler(async ({ companyId, params, body }) => {
  if (!companyId) throw new ValidationError('Missing company ID in session')

  const parsed = paramsSchema.safeParse(params)
  if (!parsed.success) throw new ValidationError('Invalid settings domain')

  const result = await settingsService.updateDomain(companyId, parsed.data.domain, body)
  return success(result)
})
