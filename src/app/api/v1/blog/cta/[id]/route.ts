import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { success } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { ctaService } from '@/server/services/cta.service'
import { idParamSchema } from '@/server/validators/common.validators'
import { updateCtaSchema } from '@/server/validators/cta.validators'

export const PUT = apiHandler(async ({ companyId, params, body }) => {
  if (!companyId) {
    throw new ValidationError('Missing company ID in session')
  }

  const { id } = validate(idParamSchema, params)
  const payload = validate(updateCtaSchema, body)
  const updated = await ctaService.updateCta(companyId, id, payload)

  return success(updated)
})

export const DELETE = apiHandler(async ({ companyId, params }) => {
  if (!companyId) {
    throw new ValidationError('Missing company ID in session')
  }

  const { id } = validate(idParamSchema, params)
  const deleted = await ctaService.deleteCta(companyId, id)

  return success(deleted)
})
