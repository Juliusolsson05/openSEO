/**
 * POST /api/admin/jobs/:jobId/retry
 *
 * Reset a FAILED/CANCELED/stuck job back to PENDING so the worker re-runs it.
 * Admin only.
 */
import { apiHandler } from '@/server/api/handler'
import { NotFoundError } from '@/server/api/errors'
import { raw } from '@/server/api/response'
import { prisma } from '@/lib/prisma'
import { getStatus, retry } from '@/server/jobs/queue'

export const POST = apiHandler(async (ctx) => {
  const jobId = String(ctx.params.jobId)
  const existing = await prisma.backgroundJob.findUnique({ where: { id: jobId }, select: { id: true } })
  if (!existing) {
    throw new NotFoundError(`Job ${jobId} not found`)
  }
  await retry(jobId)
  const status = await getStatus(jobId)
  return raw(status)
}, { admin: true })
