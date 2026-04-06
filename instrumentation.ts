/**
 * Next.js instrumentation hook.
 *
 * Runs exactly once per Next.js server process at startup. We use it to:
 * 1. Fail-fast env validation — refuse to boot without real secrets.
 * 2. Spawn the background-job worker inline so a single `npm run dev` boots
 *    both the HTTP server and the queue consumer.
 *
 * Guards:
 * - Only runs under the Node.js runtime (edge/middleware imports are skipped).
 * - `DISABLE_INLINE_WORKER=1` disables the inline worker (used in production
 *   where a dedicated `npm run worker` process runs alongside Next.js).
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  // Fail fast if required secrets are missing or still placeholders.
  const { assertServerEnv } = await import('./src/lib/env')
  assertServerEnv()

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
