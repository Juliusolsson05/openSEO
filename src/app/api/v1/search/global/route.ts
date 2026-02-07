import { z } from 'zod'

import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { success } from '@/server/api/response'
import { globalSearchService } from '@/server/services/global-search.service'

const querySchema = z.object({
  q: z.string().trim().min(1),
  limit: z.coerce.number().int().min(1).max(20).default(8),
})

export const GET = apiHandler(async ({ companyId, searchParams }) => {
  if (!companyId) throw new ValidationError('Missing company ID in session')

  const parsed = querySchema.safeParse({
    q: searchParams.get('q') ?? '',
    limit: searchParams.get('limit') ?? undefined,
  })

  if (!parsed.success) {
    return success([])
  }

  const data = await globalSearchService.search(companyId, parsed.data.q, parsed.data.limit)
  return success(data)
})
