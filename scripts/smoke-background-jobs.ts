/**
 * Smoke test for the durable background-job queue (P24A).
 *
 * Runs end-to-end against a real Postgres so we can actually exercise
 * `FOR UPDATE SKIP LOCKED`, which the unit-test suite cannot cover.
 *
 * Usage:
 *   DATABASE_URL=postgres://... npx tsx scripts/smoke-background-jobs.ts
 *
 * What it does:
 *   1. enqueues a test job
 *   2. registers a handler that appends a log and returns a result
 *   3. runs the worker once, asserts status=COMPLETED and logs present
 *   4. enqueues a job with no handler and asserts it terminates FAILED
 *   5. enqueues a job whose handler throws; asserts retry path fires
 *   6. claims two jobs concurrently and asserts SKIP LOCKED hands out
 *      distinct rows (i.e. no double-claim)
 *   7. cleans up everything it created
 *
 * Exit code 0 on success, non-zero on any assertion failure.
 */
import { PrismaClient } from '@prisma/client'

import { registerHandler, runOnce, clearHandlers } from '@/server/jobs/worker'
import { claimNext, enqueue, getStatus } from '@/server/jobs/queue'

const prisma = new PrismaClient()

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`)
  }
}

async function main() {
  const createdIds: string[] = []
  try {
    // 1. Happy path -------------------------------------------------------
    clearHandlers()
    registerHandler('smoke.happy', async (ctx) => {
      await ctx.appendLog({ stage: 'smoke', type: 'hello', data: { n: 1 } })
      return { ok: true }
    })

    const happy = await enqueue('smoke.happy', { payload: 1 })
    createdIds.push(happy.id)
    console.log(`[1] enqueued happy job ${happy.id}`)

    const worked = await runOnce('smoke-worker')
    assert(worked, 'runOnce should have processed the happy job')
    const happyStatus = await getStatus(happy.id)
    assert(happyStatus?.status === 'completed', `expected completed, got ${happyStatus?.status}`)
    assert(happyStatus.logs.length >= 1, 'expected at least one log entry')
    console.log('[1] PASS: happy path completed with logs')

    // 2. No handler ------------------------------------------------------
    const orphan = await enqueue('smoke.nohandler', {})
    createdIds.push(orphan.id)
    await runOnce('smoke-worker')
    const orphanStatus = await getStatus(orphan.id)
    assert(orphanStatus?.status === 'failed', 'orphan should be failed (no retry)')
    console.log('[2] PASS: unknown job_type terminates failed')

    // 3. Retry path ------------------------------------------------------
    let attempts = 0
    registerHandler('smoke.retry', async () => {
      attempts++
      throw new Error('intentional boom')
    })
    const retryJob = await enqueue('smoke.retry', {}, { maxAttempts: 2 })
    createdIds.push(retryJob.id)
    await runOnce('smoke-worker')
    const midStatus = await getStatus(retryJob.id)
    // After first failed attempt with attempts(1) < max_attempts(2), status
    // should be back to PENDING for retry.
    assert(midStatus?.status === 'accepted', `expected accepted after 1st fail, got ${midStatus?.status}`)
    // Force the retry to run now by clearing next_run_at.
    await prisma.backgroundJob.update({
      where: { id: retryJob.id },
      data: { next_run_at: new Date() },
    })
    await runOnce('smoke-worker')
    const finalStatus = await getStatus(retryJob.id)
    assert(finalStatus?.status === 'failed', `expected failed after 2nd attempt, got ${finalStatus?.status}`)
    assert(attempts === 2, `handler should have been called twice, got ${attempts}`)
    console.log('[3] PASS: retry path exhausts and terminates failed')

    // 4. SKIP LOCKED concurrency ----------------------------------------
    clearHandlers()
    const a = await enqueue('smoke.concurrent', { n: 'a' })
    const b = await enqueue('smoke.concurrent', { n: 'b' })
    createdIds.push(a.id, b.id)
    const [claimA, claimB] = await Promise.all([
      claimNext('smoke-w1'),
      claimNext('smoke-w2'),
    ])
    assert(claimA && claimB, 'both concurrent claims should succeed')
    assert(claimA.id !== claimB.id, `SKIP LOCKED must return distinct rows, got ${claimA.id} twice`)
    console.log(`[4] PASS: concurrent claims returned distinct rows (${claimA.id} / ${claimB.id})`)
  } finally {
    if (createdIds.length > 0) {
      await prisma.backgroundJob.deleteMany({ where: { id: { in: createdIds } } })
      console.log(`[cleanup] removed ${createdIds.length} test rows`)
    }
    await prisma.$disconnect()
  }
}

main()
  .then(() => {
    console.log('\nSMOKE OK')
    process.exit(0)
  })
  .catch((err) => {
    console.error('\nSMOKE FAILED:', err)
    process.exit(1)
  })
