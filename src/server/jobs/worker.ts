/**
 * Worker loop for the durable background job queue (P24A).
 *
 * Runs `claimNext` in a loop, dispatches to a handler registered for the
 * job's `job_type`, and routes success/failure through queue helpers.
 *
 * Handlers are registered via `registerHandler` (the default registry is
 * shared process-wide). Sub-plans B/C/D wire concrete handlers in
 * `handlers.ts`; this sub-plan leaves the registry empty.
 */
import type { BackgroundJob } from '@prisma/client'

import { appendLog, claimNext, complete, fail } from './queue'

export type JobHandlerContext = {
  job: BackgroundJob
  /** Append a structured log row visible to the polling client. */
  appendLog: (log: { stage: string; type: string; data?: Record<string, unknown> }) => Promise<void>
}

export type JobHandler = (
  ctx: JobHandlerContext,
) => Promise<Record<string, unknown> | void>

const handlers = new Map<string, JobHandler>()

export function registerHandler(jobType: string, handler: JobHandler): void {
  // Overwrite silently: Next.js dev mode re-executes modules on hot reload.
  handlers.set(jobType, handler)
}

export function getRegisteredHandler(jobType: string): JobHandler | undefined {
  return handlers.get(jobType)
}

export function listRegisteredHandlers(): string[] {
  return Array.from(handlers.keys()).sort()
}

export function clearHandlers(): void {
  handlers.clear()
}

/**
 * Execute at most one job. Returns true if a job was processed (success OR
 * failure), false if the queue was empty.
 */
export async function runOnce(workerId: string): Promise<boolean> {
  const job = await claimNext(workerId)
  if (!job) return false

  const handler = handlers.get(job.job_type)
  if (!handler) {
    await fail(
      job.id,
      `No handler registered for job_type="${job.job_type}"`,
      { retry: false },
    )
    return true
  }

  try {
    const result = await handler({
      job,
      appendLog: (log) => appendLog(job.id, log),
    })
    await complete(job.id, result ?? undefined)
  } catch (err) {
    const message =
      err instanceof Error
        ? `${err.message}${err.stack ? `\n${err.stack}` : ''}`
        : String(err)
    await fail(job.id, message)
  }
  return true
}

export type RunForeverOptions = {
  pollIntervalMs?: number
  /** Abort signal that gracefully ends the loop between jobs. */
  signal?: AbortSignal
  /** Swallow per-iteration errors and keep looping. Default true. */
  logErrors?: boolean
}

/**
 * Poll forever (or until `signal` aborts). Sleeps `pollIntervalMs` between
 * empty polls; runs back-to-back while jobs are available.
 */
export async function runForever(
  workerId: string,
  options: RunForeverOptions = {},
): Promise<void> {
  const pollIntervalMs = options.pollIntervalMs ?? 1000
  const logErrors = options.logErrors ?? true

  while (!options.signal?.aborted) {
    try {
      const worked = await runOnce(workerId)
      if (!worked) {
        await sleep(pollIntervalMs, options.signal)
      }
    } catch (err) {
      // runOnce already catches handler errors; anything here is a queue
      // infra failure (DB down, etc). Back off and keep going.
      if (logErrors) {
        console.error('[jobs.worker] loop error', err)
      }
      await sleep(pollIntervalMs, options.signal)
    }
  }
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal?.aborted) return resolve()
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      clearTimeout(timer)
      resolve()
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}
