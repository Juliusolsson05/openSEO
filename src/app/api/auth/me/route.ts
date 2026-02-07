import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'

export const GET = apiHandler(async (ctx) => raw({ user: ctx.user }))
