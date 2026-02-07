import { z } from 'zod'

import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { success } from '@/server/api/response'
import { notificationFeedService } from '@/server/services/notification-feed.service'

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

export const GET = apiHandler(async ({ companyId, searchParams }) => {
  if (!companyId) throw new ValidationError('Missing company ID in session')

  const parsed = querySchema.safeParse({
    limit: searchParams.get('limit') ?? undefined,
  })

  const limit = parsed.success ? parsed.data.limit : 20
  const data = await notificationFeedService.list(companyId, limit)
  return success(data)
})
