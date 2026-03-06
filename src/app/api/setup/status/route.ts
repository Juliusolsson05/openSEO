import { apiHandler } from '@/server/api/handler'
import { success } from '@/server/api/response'
import { getSetupStatus } from '@/server/setup'

export const GET = apiHandler(async () => {
  const status = await getSetupStatus()
  return success(status)
}, { auth: false })
