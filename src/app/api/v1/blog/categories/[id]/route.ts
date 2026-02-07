import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { success } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { categoryService } from '@/server/services/category.service'
import { updateCategorySchema } from '@/server/validators/category.validators'

export const PUT = apiHandler(async ({ companyId, params, body }) => {
  if (!companyId) throw new ValidationError('Missing company ID in session')

  const id = Number(params.id)
  if (!Number.isInteger(id) || id <= 0) throw new ValidationError('Invalid category id')

  const payload = validate(updateCategorySchema, body)
  const updated = await categoryService.editCategory(id, companyId, payload)

  return success(updated)
})

export const DELETE = apiHandler(async ({ companyId, params }) => {
  if (!companyId) throw new ValidationError('Missing company ID in session')

  const id = Number(params.id)
  if (!Number.isInteger(id) || id <= 0) throw new ValidationError('Invalid category id')

  const deleted = await categoryService.deleteCategory(id, companyId)
  return success(deleted)
})
