import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { analyticsService } from '@/server/services/analytics.service'

const handler = apiHandler(async (ctx) => {
  const includeRecommendationsParam = (ctx.searchParams.get('include_recommendations') ?? 'true').toLowerCase()
  const includeRecommendations = !['false', '0', 'no'].includes(includeRecommendationsParam)
  return raw(await analyticsService.getGeneralAnalytics(ctx.companyId!, includeRecommendations))
})
export const GET = handler
