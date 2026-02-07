import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { success } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { elementService } from '@/server/services/element.service'
import { addElementSchema } from '@/server/validators/element.validators'

export const GET = apiHandler(async ({ companyId, params }) => {
  if (!companyId) throw new ValidationError('Missing company ID in session')

  const blogPostId = Number(params.id)
  if (!Number.isInteger(blogPostId) || blogPostId <= 0) {
    throw new ValidationError('Invalid blog post id')
  }

  const elements = await elementService.listElements(blogPostId, companyId)
  return success(elements)
})

export const POST = apiHandler(async ({ companyId, params, body }) => {
  if (!companyId) throw new ValidationError('Missing company ID in session')

  const payload = validate(addElementSchema, {
    ...(typeof body === 'object' && body ? body : {}),
    blogPostId: params.id,
  })

  const created = await elementService.addElement(payload.blogPostId, companyId, payload)
  return success(created, 201)
})
