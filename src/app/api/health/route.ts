import { prisma } from '@/lib/prisma'
import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'

export const GET = apiHandler(
  async () => {
    const checks: Record<string, { status: string; latencyMs?: number }> = {}

    // Database check
    const dbStart = performance.now()
    try {
      await prisma.$queryRaw`SELECT 1`
      checks.database = { status: 'ok', latencyMs: Math.round(performance.now() - dbStart) }
    } catch {
      checks.database = { status: 'error', latencyMs: Math.round(performance.now() - dbStart) }
    }

    const overallStatus = Object.values(checks).every((c) => c.status === 'ok') ? 'ok' : 'error'

    const response = raw({ status: overallStatus, checks }, overallStatus === 'ok' ? 200 : 503)
    return response
  },
  { auth: false },
)
