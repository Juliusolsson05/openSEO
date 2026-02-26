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

type TitleRow = Record<string, unknown>

function serializeTitle(t: TitleRow, blogPostLinkMap: Map<number, number[]>) {
  const blogPost = t.blogPost as { id?: number } | null | undefined
  const blogPostId = typeof blogPost?.id === 'number' ? blogPost.id : null

  // Map BlogPostPostLink edges back to title IDs via the blogPostLinkMap
  const linkedTitleIds = blogPostId ? (blogPostLinkMap.get(blogPostId) ?? []) : []

  return {
    ...t,
    status: STATUS_TO_NUMBER[(t.status as TitleStatus)] ?? 1,
    dateCreated: t.created_at,
    generatedDate: t.generated_date,
    scheduledDate: t.scheduled_date,
    company: t.companyId,
    postId: blogPostId,
    post_linking: linkedTitleIds,
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
        _count: { select: { categories: true } },
      },
      orderBy: { created_at: 'desc' },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.title.count({ where }),
  ])

  // Build a complete blogPostId → title.id reverse lookup for the whole company
  // (links may point to titles outside the current page)
  const allTitleMappings = await prisma.title.findMany({
    where: { companyId: ctx.companyId!, blogPostId: { not: null } },
    select: { id: true, blogPostId: true },
  })
  const blogPostIdToTitleId = new Map<number, number>()
  for (const t of allTitleMappings) {
    if (t.blogPostId != null) blogPostIdToTitleId.set(t.blogPostId, t.id)
  }

  const blogPostIds = data.map((t) => t.blogPostId).filter((id): id is number => id != null)
  const blogPostLinks = blogPostIds.length
    ? await prisma.blogPostPostLink.findMany({
        where: { fromBlogPostId: { in: blogPostIds } },
        select: { fromBlogPostId: true, toBlogPostId: true },
      })
    : []

  // Map fromBlogPostId → list of target title IDs
  const blogPostLinkMap = new Map<number, number[]>()
  for (const link of blogPostLinks) {
    const targetTitleId = blogPostIdToTitleId.get(link.toBlogPostId)
    if (targetTitleId == null) continue
    const list = blogPostLinkMap.get(link.fromBlogPostId) ?? []
    list.push(targetTitleId)
    blogPostLinkMap.set(link.fromBlogPostId, list)
  }

  return raw({ data: data.map((t) => serializeTitle(t as unknown as TitleRow, blogPostLinkMap)), total, page: query.page, pageSize: query.pageSize })
})

export const GET = handler
