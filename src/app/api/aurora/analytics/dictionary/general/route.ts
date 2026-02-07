import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { analyticsService } from '@/server/services/analytics.service'

const handler = apiHandler(async (ctx) => {
  const includeAllWordsLinks = (ctx.searchParams.get('include_all_words_links') ?? 'false').toLowerCase() === 'true'
  return raw(await analyticsService.getDictionaryAnalytics(ctx.companyId!, includeAllWordsLinks))
})
export const GET = handler
