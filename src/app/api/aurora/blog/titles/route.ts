import { prisma } from '@/lib/prisma'
import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { listTitlesQuerySchema } from '@/server/validators/title.validators'

const handler = apiHandler(async (ctx) => {
  const categoryIds = ctx.searchParams.getAll('category_ids').flatMap((value) =>
    value
      .split(',')
      .map((part) => Number(part.trim()))
      .filter((id) => Number.isInteger(id) && id > 0),
  )

  const query = validate(listTitlesQuerySchema, {
    page: ctx.searchParams.get('page') ?? 1,
    pageSize: ctx.searchParams.get('pageSize') ?? ctx.searchParams.get('limit') ?? 50,
    status: ctx.searchParams.get('status') ?? undefined,
    search: ctx.searchParams.get('search') ?? ctx.searchParams.get('q') ?? undefined,
  })

  const where = {
    companyId: ctx.companyId!,
    ...(query.status ? { status: query.status } : {}),
    ...(query.search
      ? {
          OR: [
            { title_text: { contains: query.search, mode: 'insensitive' as const } },
            { seo_title: { contains: query.search, mode: 'insensitive' as const } },
            { focus_keyword: { contains: query.search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
    ...(categoryIds.length
      ? {
          categories: {
            some: {
              id: { in: categoryIds },
            },
          },
        }
      : {}),
  }

  const [data, total] = await Promise.all([
    prisma.title.findMany({
      where,
      include: { categories: true, bulk_schedule: true, _count: { select: { categories: true } } },
      orderBy: { created_at: 'desc' },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.title.count({ where }),
  ])

  return raw({ data, total, page: query.page, pageSize: query.pageSize })
})

export const GET = handler
