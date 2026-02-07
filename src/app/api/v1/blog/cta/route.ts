import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { success } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { ctaService } from '@/server/services/cta.service'
import { createCtaSchema } from '@/server/validators/cta.validators'

export const GET = apiHandler(async ({ companyId }) => {
  if (!companyId) {
    throw new ValidationError('Missing company ID in session')
  }

  const items = await ctaService.listCtas(companyId)
  return success(items)
})

export const POST = apiHandler(async ({ companyId, body }) => {
  if (!companyId) {
    throw new ValidationError('Missing company ID in session')
  }

  const payload = validate(createCtaSchema, body)
  const created = await ctaService.createCta(companyId, payload)
  return success(created, 201)
})
