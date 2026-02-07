import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { success } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { ctaService } from '@/server/services/cta.service'
import { idParamSchema } from '@/server/validators/common.validators'
import { updateCampaignSchema } from '@/server/validators/cta.validators'

export const PUT = apiHandler(async ({ companyId, params, body }) => {
  if (!companyId) {
    throw new ValidationError('Missing company ID in session')
  }

  const { id } = validate(idParamSchema, params)
  const payload = validate(updateCampaignSchema, body)
  const updated = await ctaService.updateCampaign(companyId, id, payload)

  return success(updated)
})

export const DELETE = apiHandler(async ({ companyId, params }) => {
  if (!companyId) {
    throw new ValidationError('Missing company ID in session')
  }

  const { id } = validate(idParamSchema, params)
  const deleted = await ctaService.deleteCampaign(companyId, id)

  return success(deleted)
})
