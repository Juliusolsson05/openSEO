import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { scheduleService } from '@/server/services/schedule.service'
import { createBulkScheduleSchema } from '@/server/validators/schedule.validators'

const handler = apiHandler(async (ctx) => {
  const payload = validate(createBulkScheduleSchema, ctx.body ?? {})
  const created = await scheduleService.createBulkSchedule(ctx.companyId!, payload)
  return raw(created, 201)
})

export const POST = handler
