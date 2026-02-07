import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'

export const GET = apiHandler(
  async () => raw({ status: 'ok' }),
  { auth: false },
)
