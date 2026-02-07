import { ValidationError } from '@/server/api/errors'
import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { productService } from '@/server/services/product.service'

const handler = apiHandler(async (ctx) => {
  const body = (ctx.body ?? {}) as Record<string, unknown>
  const products = Array.isArray(body.products) ? (body.products as any[]) : []
  if (!products.length) throw new ValidationError('products is required')
  return raw(await productService.importProducts(ctx.companyId!, products as any))
})

export const POST = handler
