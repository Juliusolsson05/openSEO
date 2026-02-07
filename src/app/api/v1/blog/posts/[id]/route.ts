import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { success } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { blogService } from '@/server/services/blog.service'
import { blogPostIdSchema, updateBlogPostSchema } from '@/server/validators/blog.validators'

export const GET = apiHandler(async ({ companyId, params }) => {
  if (!companyId) {
    throw new ValidationError('Missing company ID in session')
  }

  const { id } = validate(blogPostIdSchema, params)
  const post = await blogService.getPost(id, companyId)

  return success(post)
})

export const PUT = apiHandler(async ({ companyId, params, body }) => {
  if (!companyId) {
    throw new ValidationError('Missing company ID in session')
  }

  const { id } = validate(blogPostIdSchema, params)
  const payload = validate(updateBlogPostSchema, body)
  const updated = await blogService.updatePost(id, companyId, payload)

  return success(updated)
})

export const DELETE = apiHandler(async ({ companyId, params }) => {
  if (!companyId) {
    throw new ValidationError('Missing company ID in session')
  }

  const { id } = validate(blogPostIdSchema, params)
  await blogService.deletePost(id, companyId)

  return success({ deleted: true })
})
