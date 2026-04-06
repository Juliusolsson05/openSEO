import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { dictionaryService, type DictionaryListStatusFilter } from '@/server/services/dictionary.service'

const ALLOWED_STATUS = new Set<DictionaryListStatusFilter>(['all', 'active', 'completed'])

const handler = apiHandler(async (ctx) => {
  const page = Math.max(1, Number(ctx.searchParams.get('page') ?? 1) || 1)
  const pageSize = Math.max(1, Math.min(100, Number(ctx.searchParams.get('itemsPerPage') ?? ctx.searchParams.get('pageSize') ?? 20) || 20))
  const search = (ctx.searchParams.get('q') ?? '').trim() || undefined
  const rawStatus = (ctx.searchParams.get('status') ?? 'all') as DictionaryListStatusFilter
  const status: DictionaryListStatusFilter = ALLOWED_STATUS.has(rawStatus) ? rawStatus : 'all'

  const result = await dictionaryService.listDictionaries(ctx.companyId!, { search, page, pageSize, status })
  return raw(result)
})

export const GET = handler
