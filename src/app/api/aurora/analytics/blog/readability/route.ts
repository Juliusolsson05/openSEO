import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { analyticsService } from '@/server/services/analytics.service'

const handler = apiHandler(async (ctx) => {
  const blogPostId = Number(ctx.searchParams.get('blog_post_id') ?? 0) || undefined
  return raw(await analyticsService.getReadabilityAnalytics(ctx.companyId!, blogPostId))
})
export const GET = handler
