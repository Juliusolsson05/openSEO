import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { success } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { categoryService } from '@/server/services/category.service'
import { bulkDeleteCategoriesSchema } from '@/server/validators/category.validators'

export const POST = apiHandler(async ({ companyId, body }) => {
  if (!companyId) throw new ValidationError('Missing company ID in session')

  const payload = validate(bulkDeleteCategoriesSchema, body)
  const result = await categoryService.bulkDeleteCategories(payload.ids, companyId)

  return success(result)
})
