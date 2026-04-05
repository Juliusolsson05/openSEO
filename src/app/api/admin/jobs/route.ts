/**
 * GET /api/admin/jobs
 *
 * List recent background jobs with optional filters. Admin only.
 *
 * Query params:
 *   status  BackgroundJobStatus (PENDING|RUNNING|COMPLETED|FAILED|CANCELED)
 *   type    job_type exact match (e.g. "quillo.autopilot")
 *   limit   number, 1..200 (default 50)
 */
import type { BackgroundJobStatus, Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { toStatusPayload } from '@/server/jobs/queue'

const ALLOWED_STATUSES: BackgroundJobStatus[] = [
  'PENDING',
  'RUNNING',
  'COMPLETED',
  'FAILED',
  'CANCELED',
]

export const GET = apiHandler(async (ctx) => {
  const statusParam = ctx.searchParams.get('status') ?? undefined
  const typeParam = ctx.searchParams.get('type') ?? undefined
  const limitParam = Number(ctx.searchParams.get('limit') ?? '50')

  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(Math.trunc(limitParam), 1), 200)
    : 50

  const where: Prisma.BackgroundJobWhereInput = {}
  if (statusParam && (ALLOWED_STATUSES as string[]).includes(statusParam)) {
    where.status = statusParam as BackgroundJobStatus
  }
  if (typeParam) {
    where.job_type = typeParam
  }

  const [jobs, oldestPending] = await Promise.all([
    prisma.backgroundJob.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: limit,
    }),
    prisma.backgroundJob.findFirst({
      where: { status: 'PENDING' },
      orderBy: { next_run_at: 'asc' },
      select: { next_run_at: true },
    }),
  ])

  const oldestPendingAgeSeconds = oldestPending
    ? Math.max(0, Math.floor((Date.now() - oldestPending.next_run_at.getTime()) / 1000))
    : null

  return raw({
    jobs: jobs.map(toStatusPayload),
    meta: {
      count: jobs.length,
      oldest_pending_age_seconds: oldestPendingAgeSeconds,
    },
  })
}, { admin: true })
