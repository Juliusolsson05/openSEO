import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { scheduleService } from '@/server/services/schedule.service'
import { assignToBulkSchema } from '@/server/validators/schedule.validators'

const handler = apiHandler(async (ctx) => {
  const payload = validate(assignToBulkSchema, ctx.body ?? {})
  const result = await scheduleService.assignToBulk(ctx.companyId!, payload.titleIds, payload.bulkScheduleId)
  return raw(result)
})

export const POST = handler
