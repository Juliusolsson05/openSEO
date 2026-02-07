import { apiHandler } from '@/server/api/handler'
import { success } from '@/server/api/response'

export const GET = apiHandler(
  async () => {
    return success({
      status: 'ok',
      service: 'aurora-dashboard-next',
      timestamp: new Date().toISOString(),
    })
  },
  { auth: false },
)
