import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { success } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { elementService } from '@/server/services/element.service'
import { updateElementSchema } from '@/server/validators/element.validators'

export const PUT = apiHandler(async ({ companyId, params, body }) => {
  if (!companyId) throw new ValidationError('Missing company ID in session')

  const id = Number(params.id)
  if (!Number.isInteger(id) || id <= 0) throw new ValidationError('Invalid element id')

  const payload = validate(updateElementSchema, body)
  const updated = await elementService.updateElement(id, companyId, payload)

  return success(updated)
})

export const DELETE = apiHandler(async ({ companyId, params }) => {
  if (!companyId) throw new ValidationError('Missing company ID in session')

  const id = Number(params.id)
  if (!Number.isInteger(id) || id <= 0) throw new ValidationError('Invalid element id')

  const deleted = await elementService.deleteElement(id, companyId)
  return success(deleted)
})
