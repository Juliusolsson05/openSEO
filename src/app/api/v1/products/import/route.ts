import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { success } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { productService } from '@/server/services/product.service'
import { importProductsSchema } from '@/server/validators/product.validators'

export const POST = apiHandler(async ({ companyId, body }) => {
  if (!companyId) {
    throw new ValidationError('Missing company ID in session')
  }

  const payload = validate(importProductsSchema, body)
  const imported = await productService.importProducts(companyId, payload.products)

  return success({ count: imported.length, items: imported }, 201)
})
