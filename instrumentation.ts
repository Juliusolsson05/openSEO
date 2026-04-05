/**
 * Next.js instrumentation hook (P24A foundation).
 *
 * Runs exactly once per Next.js server process at startup. We use it to
 * spawn the background-job worker inline so a single `npm run dev` boots
 * both the HTTP server and the queue consumer.
 *
 * Guards:
 * - Only runs under the Node.js runtime (edge/middleware imports are skipped).
 * - `DISABLE_INLINE_WORKER=1` disables the inline worker (used in production
 *   where a dedicated `npm run worker` process runs alongside Next.js — sub-plan E).
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  if (process.env.DISABLE_INLINE_WORKER === '1') return

  const [{ runForever }, { registerAllHandlers }] = await Promise.all([
    import('@/server/jobs/worker'),
    import('@/server/jobs/handlers'),
  ])

  registerAllHandlers()

  const workerId = `inline-${process.pid}`
  // Fire and forget: runForever is an infinite loop; top-level await here
  // would block the Next.js boot sequence.
  void runForever(workerId, { pollIntervalMs: 1000 }).catch((err) => {
    console.error('[jobs.worker] runForever crashed', err)
  })

  console.log(`[jobs.worker] inline worker started (${workerId})`)
}
