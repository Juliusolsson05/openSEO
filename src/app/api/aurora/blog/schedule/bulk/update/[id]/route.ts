import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { scheduleService } from '@/server/services/schedule.service'
import { updateBulkScheduleSchema } from '@/server/validators/schedule.validators'

const handler = apiHandler(async (ctx) => {
  const bulkScheduleId = Number(ctx.params.id)
  const payload = validate(updateBulkScheduleSchema, ctx.body ?? {})
  const updated = await scheduleService.updateBulkSchedule(ctx.companyId!, bulkScheduleId, payload)
  return raw(updated)
})

export const PUT = handler
export const PATCH = handler
