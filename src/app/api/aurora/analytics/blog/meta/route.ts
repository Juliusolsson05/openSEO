import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { analyticsService } from '@/server/services/analytics.service'

const handler = apiHandler(async (ctx) => raw(await analyticsService.getMetaAnalytics(ctx.companyId!)))
export const GET = handler
