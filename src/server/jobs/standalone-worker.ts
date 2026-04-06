/**
 * Standalone worker process.
 *
 * Usage: node --import tsx src/server/jobs/standalone-worker.ts
 * Or via: npm run worker
 *
 * Writes /tmp/worker-health every 30s for Docker health checks.
 */
import { registerAllHandlers } from './handlers'
import { runForever } from './worker'
import { writeFileSync } from 'fs'

registerAllHandlers()

const workerId = `worker-${process.pid}`
console.log(`[worker] Starting standalone worker (${workerId})`)

// Health file for Docker health check (touch every 30s)
const HEALTH_FILE = '/tmp/worker-health'
setInterval(() => {
  try { writeFileSync(HEALTH_FILE, Date.now().toString()) } catch {}
}, 30_000)
// Write immediately so health check passes on startup
writeFileSync(HEALTH_FILE, Date.now().toString())

runForever(workerId, { pollIntervalMs: 1000 }).catch((err) => {
  console.error('[worker] Fatal error:', err)
  process.exit(1)
})
