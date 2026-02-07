import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { scheduleService } from '@/server/services/schedule.service'
import { removeFromBulkSchema } from '@/server/validators/schedule.validators'

const handler = apiHandler(async (ctx) => {
  const payload = validate(removeFromBulkSchema, ctx.body ?? {})
  const result = await scheduleService.removeFromBulk(ctx.companyId!, payload.titleIds)
  return raw(result)
})

export const POST = handler
