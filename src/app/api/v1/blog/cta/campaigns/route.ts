import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { success } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { ctaService } from '@/server/services/cta.service'
import { createCampaignSchema } from '@/server/validators/cta.validators'

export const POST = apiHandler(async ({ companyId, body }) => {
  if (!companyId) {
    throw new ValidationError('Missing company ID in session')
  }

  const payload = validate(createCampaignSchema, body)
  const created = await ctaService.createCampaign(companyId, payload)

  return success(created, 201)
})
