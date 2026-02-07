import { z } from 'zod'

import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { success } from '@/server/api/response'
import { publishingSyncService } from '@/server/services/publishing-sync.service'

const schema = z.object({
  post_id: z.number().int().positive(),
})

export const POST = apiHandler(async ({ companyId, body }) => {
  if (!companyId) throw new ValidationError('Missing company ID in session')

  const parsed = schema.safeParse(body)
  if (!parsed.success) throw new ValidationError('post_id is required')

  const result = await publishingSyncService.pushPost(companyId, parsed.data.post_id)
  return success(result)
})
