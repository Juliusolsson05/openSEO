/**
 * GET /api/admin/jobs/:jobId       - fetch a single job's full status
 *
 * Admin only.
 */
import { apiHandler } from '@/server/api/handler'
import { NotFoundError } from '@/server/api/errors'
import { raw } from '@/server/api/response'
import { getStatus } from '@/server/jobs/queue'

export const GET = apiHandler(async (ctx) => {
  const jobId = String(ctx.params.jobId)
  const status = await getStatus(jobId)
  if (!status) {
    throw new NotFoundError(`Job ${jobId} not found`)
  }
  return raw(status)
}, { admin: true })
