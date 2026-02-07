import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { scheduleService } from '@/server/services/schedule.service'
import { schedulePostSchema } from '@/server/validators/schedule.validators'

const handler = apiHandler(async (ctx) => {
  const postId = Number(ctx.params.id)
  const payload = validate(schedulePostSchema, ctx.body ?? {})
  const result = await scheduleService.schedulePost(ctx.companyId!, postId, payload.date)
  return raw(result)
})

export const POST = handler
