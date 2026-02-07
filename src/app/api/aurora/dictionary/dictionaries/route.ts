import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { dictionaryService } from '@/server/services/dictionary.service'

const handler = apiHandler(async (ctx) => {
  const page = Math.max(1, Number(ctx.searchParams.get('page') ?? 1) || 1)
  const pageSize = Math.max(1, Math.min(100, Number(ctx.searchParams.get('itemsPerPage') ?? ctx.searchParams.get('pageSize') ?? 20) || 20))
  const search = (ctx.searchParams.get('q') ?? '').trim() || undefined
  const result = await dictionaryService.listDictionaries(ctx.companyId!, { search, page, pageSize })
  return raw(result)
})

export const GET = handler
