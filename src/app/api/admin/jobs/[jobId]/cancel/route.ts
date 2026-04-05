/**
 * POST /api/admin/jobs/:jobId/cancel
 *
 * Mark a PENDING/RUNNING job as CANCELED. Admin only. If the worker is
 * currently executing the job this does not interrupt it in-process; the
 * handler will still run to completion but status reads will report
 * `failed` (CANCELED maps to `failed` in the public contract).
 */
import { apiHandler } from '@/server/api/handler'
import { NotFoundError } from '@/server/api/errors'
import { raw } from '@/server/api/response'
import { prisma } from '@/lib/prisma'
import { cancel, getStatus } from '@/server/jobs/queue'

export const POST = apiHandler(async (ctx) => {
  const jobId = String(ctx.params.jobId)
  const existing = await prisma.backgroundJob.findUnique({ where: { id: jobId }, select: { id: true } })
  if (!existing) {
    throw new NotFoundError(`Job ${jobId} not found`)
  }
  await cancel(jobId)
  const status = await getStatus(jobId)
  return raw(status)
}, { admin: true })
