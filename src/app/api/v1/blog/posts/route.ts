import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { paginated, success } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { blogService } from '@/server/services/blog.service'
import { createBlogPostSchema, listBlogPostsQuerySchema } from '@/server/validators/blog.validators'

export const GET = apiHandler(async ({ companyId, searchParams }) => {
  if (!companyId) {
    throw new ValidationError('Missing company ID in session')
  }

  const query = validate(listBlogPostsQuerySchema, Object.fromEntries(searchParams.entries()))
  const result = await blogService.listPosts(companyId, query)

  return paginated(result.data, result.total, query.page, query.pageSize)
})

export const POST = apiHandler(async ({ companyId, body }) => {
  if (!companyId) {
    throw new ValidationError('Missing company ID in session')
  }

  const payload = validate(createBlogPostSchema, body)
  const created = await blogService.createPost(companyId, payload)

  return success(created, 201)
})
