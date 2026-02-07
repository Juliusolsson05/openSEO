import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { paginated, success } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { titleService } from '@/server/services/title.service'
import { createTitleSchema, listTitlesQuerySchema } from '@/server/validators/title.validators'

export const GET = apiHandler(async ({ companyId, searchParams }) => {
  if (!companyId) throw new ValidationError('Missing company ID in session')

  const query = validate(listTitlesQuerySchema, {
    page: searchParams.get('page') ?? undefined,
    pageSize: searchParams.get('pageSize') ?? undefined,
    status: searchParams.get('status') ?? undefined,
    search: searchParams.get('search') ?? undefined,
  })

  const { items, total } = await titleService.listTitles(companyId, query)
  return paginated(items, total, query.page, query.pageSize)
})

export const POST = apiHandler(async ({ companyId, body }) => {
  if (!companyId) throw new ValidationError('Missing company ID in session')

  const payload = validate(createTitleSchema, body)
  const created = await titleService.createTitle(companyId, payload)

  return success(created, 201)
})
