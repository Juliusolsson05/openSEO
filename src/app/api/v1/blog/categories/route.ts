import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { success } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { categoryService } from '@/server/services/category.service'
import { addCategoriesSchema } from '@/server/validators/category.validators'

export const GET = apiHandler(async ({ companyId }) => {
  if (!companyId) throw new ValidationError('Missing company ID in session')

  const categories = await categoryService.listCategories(companyId)
  return success(categories)
})

export const POST = apiHandler(async ({ companyId, body }) => {
  if (!companyId) throw new ValidationError('Missing company ID in session')

  const payload = validate(addCategoriesSchema, body)
  const created = await categoryService.addCategories(companyId, payload.names)
  return success(created, 201)
})
