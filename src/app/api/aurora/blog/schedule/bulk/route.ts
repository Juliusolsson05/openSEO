import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { scheduleService } from '@/server/services/schedule.service'
import { createBulkScheduleSchema } from '@/server/validators/schedule.validators'

const handler = apiHandler(async (ctx, req) => {
  if (req.method === 'POST') {
    const payload = validate(createBulkScheduleSchema, ctx.body ?? {})
    const created = await scheduleService.createBulkSchedule(ctx.companyId!, payload)
    return raw(created, 201)
  }

  const schedules = await scheduleService.listSchedules(ctx.companyId!)
  return raw(schedules)
})

export const GET = handler
export const POST = handler
