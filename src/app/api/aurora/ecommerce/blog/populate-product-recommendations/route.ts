import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { productService } from '@/server/services/product.service'

const handler = apiHandler(async (ctx) => {
  const postId = Number(ctx.searchParams.get('blog_post_id') ?? 0) || undefined
  return raw(await productService.populateRecommendations(ctx.companyId!, postId))
})

export const GET = handler
