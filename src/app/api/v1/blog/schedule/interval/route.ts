import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { success } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { scheduleService } from '@/server/services/schedule.service'
import { scheduleByIntervalSchema } from '@/server/validators/schedule.validators'

export const POST = apiHandler(async ({ companyId, body }) => {
  if (!companyId) throw new ValidationError('Missing company ID in session')

  const payload = validate(scheduleByIntervalSchema, body)
  const result = await scheduleService.scheduleByInterval(
    companyId,
    payload.titleIds,
    payload.startDate,
    payload.intervalDays,
  )

  return success(result)
})
