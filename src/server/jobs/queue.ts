/**
 * Durable background job queue (P24A foundation).
 *
 * Postgres-backed queue using `SELECT ... FOR UPDATE SKIP LOCKED` for atomic
 * multi-worker claims. This file is the ONLY place that reads/writes the
 * `BackgroundJob` table directly; everything else should go through these
 * helpers so the contract stays consistent.
 *
 * NOTE: `claimNext` relies on Postgres-specific `FOR UPDATE SKIP LOCKED`.
 * If the underlying DB ever changes this will need to be rewritten.
 */
import type { BackgroundJob, BackgroundJobStatus, Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'

export type JobLog = {
  stage: string
  type: string
  timestamp: string
  data?: Record<string, unknown>
}

export type EnqueueOptions = {
  companyId?: number
  maxAttempts?: number
  runAt?: Date
}

export type PublicJobStatus = 'accepted' | 'running' | 'completed' | 'failed'

export type JobStatusPayload = {
  job_id: string
  /** Backwards-compat alias for legacy autopilot/website-analyzer clients. */
  task_id: string
  status: PublicJobStatus
  logs: JobLog[]
  error: string | null
  result: Prisma.JsonValue | null
  attempts: number
  max_attempts: number
  job_type: string
  created_at: string
  updated_at: string
}

/**
 * Insert a new pending job. Returns the created row so callers can hand the
 * id back to the client for polling.
 */
export async function enqueue<P extends Record<string, unknown>>(
  jobType: string,
  payload: P,
  options: EnqueueOptions = {},
): Promise<BackgroundJob> {
  return prisma.backgroundJob.create({
    data: {
      job_type: jobType,
      payload: payload as unknown as Prisma.InputJsonValue,
      companyId: options.companyId ?? null,
      max_attempts: options.maxAttempts ?? 3,
      next_run_at: options.runAt ?? new Date(),
    },
  })
}

/**
 * Atomically claim the next runnable job. Multiple workers can call this
 * concurrently; `FOR UPDATE SKIP LOCKED` guarantees each row is handed to
 * exactly one worker.
 *
 * Returns `null` when the queue is empty.
 */
export async function claimNext(workerId: string): Promise<BackgroundJob | null> {
  const rows = await prisma.$queryRaw<BackgroundJob[]>`
    UPDATE "BackgroundJob"
       SET status = 'RUNNING',
           attempts = "BackgroundJob".attempts + 1,
           locked_at = NOW(),
           locked_by = ${workerId},
           started_at = COALESCE("BackgroundJob".started_at, NOW()),
           updated_at = NOW()
     WHERE id = (
       SELECT id FROM "BackgroundJob"
        WHERE status = 'PENDING'
          AND next_run_at <= NOW()
        ORDER BY next_run_at ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 1
     )
     RETURNING *;
  `
  return rows[0] ?? null
}

/**
 * Append a structured log entry without clobbering concurrent appends.
 * Uses `jsonb || jsonb` so it is safe against interleaved writers.
 */
export async function appendLog(
  jobId: string,
  log: Omit<JobLog, 'timestamp'> & { timestamp?: string },
): Promise<void> {
  const entry: JobLog = {
    stage: log.stage,
    type: log.type,
    timestamp: log.timestamp ?? new Date().toISOString(),
    ...(log.data ? { data: log.data } : {}),
  }
  await prisma.$executeRaw`
    UPDATE "BackgroundJob"
       SET logs = logs || ${JSON.stringify([entry])}::jsonb,
           updated_at = NOW()
     WHERE id = ${jobId};
  `
}

export async function complete(
  jobId: string,
  result?: Record<string, unknown>,
): Promise<void> {
  await prisma.backgroundJob.update({
    where: { id: jobId },
    data: {
      status: 'COMPLETED',
      result: (result ?? {}) as unknown as Prisma.InputJsonValue,
      finished_at: new Date(),
      locked_at: null,
      locked_by: null,
      error: null,
    },
  })
}

export type FailOptions = {
  /** Set false to force a terminal FAILED state regardless of attempts. */
  retry?: boolean
  /** Override linear backoff (default: 30s * attempts). */
  backoffMs?: number
}

export async function fail(
  jobId: string,
  error: string,
  opts: FailOptions = {},
): Promise<void> {
  const job = await prisma.backgroundJob.findUniqueOrThrow({ where: { id: jobId } })
  const canRetry = opts.retry !== false && job.attempts < job.max_attempts
  const backoffMs = opts.backoffMs ?? 30_000 * Math.max(job.attempts, 1)

  if (canRetry) {
    await prisma.backgroundJob.update({
      where: { id: jobId },
      data: {
        status: 'PENDING',
        error,
        next_run_at: new Date(Date.now() + backoffMs),
        locked_at: null,
        locked_by: null,
      },
    })
    return
  }

  await prisma.backgroundJob.update({
    where: { id: jobId },
    data: {
      status: 'FAILED',
      error,
      finished_at: new Date(),
      locked_at: null,
      locked_by: null,
    },
  })
}

export async function cancel(jobId: string): Promise<void> {
  await prisma.backgroundJob.update({
    where: { id: jobId },
    data: {
      status: 'CANCELED',
      finished_at: new Date(),
      locked_at: null,
      locked_by: null,
    },
  })
}

export async function retry(jobId: string): Promise<void> {
  await prisma.backgroundJob.update({
    where: { id: jobId },
    data: {
      status: 'PENDING',
      attempts: 0,
      error: null,
      next_run_at: new Date(),
      locked_at: null,
      locked_by: null,
      finished_at: null,
    },
  })
}

/**
 * Read the public-facing status payload for a job. Shape is deliberately
 * compatible with the legacy `runtime.ts` `{task_id|job_id, status, logs, error}`
 * contract so frontend pollers don't need to change until sub-plan E.
 */
export async function getStatus(jobId: string): Promise<JobStatusPayload | null> {
  const job = await prisma.backgroundJob.findUnique({ where: { id: jobId } })
  if (!job) return null
  return toStatusPayload(job)
}

export function toStatusPayload(job: BackgroundJob): JobStatusPayload {
  return {
    job_id: job.id,
    task_id: job.id,
    status: mapStatus(job.status),
    logs: (job.logs as unknown as JobLog[]) ?? [],
    error: job.error,
    result: job.result,
    attempts: job.attempts,
    max_attempts: job.max_attempts,
    job_type: job.job_type,
    created_at: job.created_at.toISOString(),
    updated_at: job.updated_at.toISOString(),
  }
}

export function mapStatus(status: BackgroundJobStatus): PublicJobStatus {
  switch (status) {
    case 'PENDING':
      return 'accepted'
    case 'RUNNING':
      return 'running'
    case 'COMPLETED':
      return 'completed'
    case 'FAILED':
    case 'CANCELED':
      return 'failed'
  }
}
