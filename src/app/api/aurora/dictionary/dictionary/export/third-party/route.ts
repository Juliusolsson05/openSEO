import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'

const handler = apiHandler(async () => raw({ status: 'success', message: 'Successfully initiated export for 1 dictionaries' }))
export const POST = handler
