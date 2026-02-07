import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { success } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { scheduleService } from '@/server/services/schedule.service'
import { schedulePostSchema } from '@/server/validators/schedule.validators'

export const PUT = apiHandler(async ({ companyId, params, body }) => {
  if (!companyId) throw new ValidationError('Missing company ID in session')

  const postId = Number(params.id)
  if (!Number.isInteger(postId) || postId <= 0) throw new ValidationError('Invalid post id')

  const payload = validate(schedulePostSchema, body)
  const updated = await scheduleService.reschedulePost(companyId, postId, payload.date)

  return success(updated)
})
