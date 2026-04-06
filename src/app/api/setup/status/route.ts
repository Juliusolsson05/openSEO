import { apiHandler } from '@/server/api/handler'
import { success } from '@/server/api/response'
import { enforceRateLimit } from '@/server/api/rate-limit'
import { getSetupStatus } from '@/server/setup'

export const GET = apiHandler(async (_ctx, req) => {
  enforceRateLimit(req, { name: 'setup-status', limit: 120, windowMs: 60_000 })

  const status = await getSetupStatus()
  return success(status)
}, { auth: false })
