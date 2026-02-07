import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { scheduleService } from '@/server/services/schedule.service'
import { scheduleByIntervalSchema } from '@/server/validators/schedule.validators'

const handler = apiHandler(async (ctx) => {
  const payload = validate(scheduleByIntervalSchema, ctx.body ?? {})
  const result = await scheduleService.scheduleByInterval(
    ctx.companyId!,
    payload.titleIds,
    payload.startDate,
    payload.intervalDays,
  )
  return raw(result)
})

export const POST = handler
