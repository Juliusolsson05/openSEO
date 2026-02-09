import { TitleStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { listTitlesQuerySchema } from '@/server/validators/title.validators'

const STATUS_TO_NUMBER: Record<TitleStatus, number> = {
  TO_BE_GENERATED: 1,
  GENERATED: 2,
  APPROVED: 3,
  REJECTED: 4,
  PUBLISHED: 5,
}

function serializeTitle(t: Record<string, unknown>) {
  const blogPost = t.blogPost as { id?: number } | null | undefined
  const linkFrom = t.post_linking_from as Array<{ toTitleId: number }> | undefined

  return {
    ...t,
    status: STATUS_TO_NUMBER[(t.status as TitleStatus)] ?? 1,
    dateCreated: t.created_at,
    generatedDate: t.generated_date,
    scheduledDate: t.scheduled_date,
    company: t.companyId,
    postId: typeof blogPost?.id === 'number' ? blogPost.id : null,
    post_linking: (linkFrom ?? []).map((link) => link.toTitleId),
  }
}

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
      include: {
        categories: true,
        bulk_schedule: true,
        blogPost: { select: { id: true } },
        post_linking_from: { select: { toTitleId: true } },
        _count: { select: { categories: true } },
      },
      orderBy: { created_at: 'desc' },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.title.count({ where }),
  ])

  return raw({ data: data.map((t) => serializeTitle(t as unknown as Record<string, unknown>)), total, page: query.page, pageSize: query.pageSize })
})

export const GET = handler
