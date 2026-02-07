import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { paginated } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { productService } from '@/server/services/product.service'
import { listProductsQuerySchema } from '@/server/validators/product.validators'

export const GET = apiHandler(async ({ companyId, searchParams }) => {
  if (!companyId) {
    throw new ValidationError('Missing company ID in session')
  }

  const query = validate(listProductsQuerySchema, {
    search: searchParams.get('search') ?? undefined,
    age: searchParams.get('age') ?? undefined,
    page: searchParams.get('page') ?? undefined,
    pageSize: searchParams.get('pageSize') ?? undefined,
  })

  const { items, total } = await productService.listProducts(companyId, query)
  return paginated(items, total, query.page, query.pageSize)
})
