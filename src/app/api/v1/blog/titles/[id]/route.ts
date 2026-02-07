import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { success } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { titleService } from '@/server/services/title.service'
import { updateTitleSchema } from '@/server/validators/title.validators'

export const GET = apiHandler(async ({ companyId, params }) => {
  if (!companyId) throw new ValidationError('Missing company ID in session')

  const id = Number(params.id)
  if (!Number.isInteger(id) || id <= 0) throw new ValidationError('Invalid title id')

  const title = await titleService.getTitle(id, companyId)
  return success(title)
})

export const PUT = apiHandler(async ({ companyId, params, body }) => {
  if (!companyId) throw new ValidationError('Missing company ID in session')

  const id = Number(params.id)
  if (!Number.isInteger(id) || id <= 0) throw new ValidationError('Invalid title id')

  const payload = validate(updateTitleSchema, body)
  const updated = await titleService.updateTitle(id, companyId, payload)

  return success(updated)
})

export const DELETE = apiHandler(async ({ companyId, params }) => {
  if (!companyId) throw new ValidationError('Missing company ID in session')

  const id = Number(params.id)
  if (!Number.isInteger(id) || id <= 0) throw new ValidationError('Invalid title id')

  const deleted = await titleService.deleteTitle(id, companyId)
  return success(deleted)
})
