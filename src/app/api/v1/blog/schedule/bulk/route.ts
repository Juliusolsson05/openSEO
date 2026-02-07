import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { success } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { scheduleService } from '@/server/services/schedule.service'
import { createBulkScheduleSchema } from '@/server/validators/schedule.validators'

export const GET = apiHandler(async ({ companyId }) => {
  if (!companyId) throw new ValidationError('Missing company ID in session')

  const items = await scheduleService.listSchedules(companyId)
  return success(items)
})

export const POST = apiHandler(async ({ companyId, body }) => {
  if (!companyId) throw new ValidationError('Missing company ID in session')

  const payload = validate(createBulkScheduleSchema, body)
  const created = await scheduleService.createBulkSchedule(companyId, payload)

  return success(created, 201)
})
