import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'

export const POST = apiHandler(
  async () => raw({ detail: 'Not implemented yet' }, 501),
  { auth: false },
)
