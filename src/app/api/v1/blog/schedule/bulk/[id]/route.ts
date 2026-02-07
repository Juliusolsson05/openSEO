import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { success } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { scheduleService } from '@/server/services/schedule.service'
import { updateBulkScheduleSchema } from '@/server/validators/schedule.validators'

export const PUT = apiHandler(async ({ companyId, params, body }) => {
  if (!companyId) throw new ValidationError('Missing company ID in session')

  const id = Number(params.id)
  if (!Number.isInteger(id) || id <= 0) throw new ValidationError('Invalid schedule id')

  const payload = validate(updateBulkScheduleSchema, body)
  const updated = await scheduleService.updateBulkSchedule(companyId, id, payload)
  return success(updated)
})
