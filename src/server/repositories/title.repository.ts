import { Prisma, type TitleStatus } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import { assertCategoryOwnership } from '@/server/services/_helpers/assert-category-ownership'

type FindManyFilters = {
  page: number
  pageSize: number
  status?: TitleStatus
  search?: string
}

type CreateTitleArgs = {
  companyId: number
  titleText: string
  seoTitle?: string
  focusKeyword?: string
  categoryIds?: number[]
  status?: TitleStatus
}

type UpdateTitleArgs = {
  titleText?: string
  seoTitle?: string | null
  focusKeyword?: string | null
  status?: TitleStatus
  categoryIds?: number[]
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function uniqueSlug(
  client: Prisma.TransactionClient | typeof prisma,
  companyId: number,
  base: string,
) {
  const cleaned = slugify(base) || 'title'
  let idx = 0
  while (true) {
    const candidate = idx === 0 ? cleaned : `${cleaned}-${idx}`
    const exists = await client.title.findUnique({
      where: { companyId_slug: { companyId, slug: candidate } },
      select: { id: true },
    })
    if (!exists) return candidate
    idx += 1
  }
}

function buildWhere(companyId: number, filters: Omit<FindManyFilters, 'page' | 'pageSize'>): Prisma.TitleWhereInput {
  return {
    companyId,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.search
      ? {
          OR: [
            { title_text: { contains: filters.search, mode: 'insensitive' } },
            { seo_title: { contains: filters.search, mode: 'insensitive' } },
            { focus_keyword: { contains: filters.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  }
}

export async function findMany(companyId: number, filters: FindManyFilters) {
  const where = buildWhere(companyId, {
    status: filters.status,
    search: filters.search,
  })

  return prisma.title.findMany({
    where,
    skip: (filters.page - 1) * filters.pageSize,
    take: filters.pageSize,
    orderBy: { created_at: 'desc' },
    include: { categories: true, _count: { select: { categories: true } } },
  })
}

export async function findById(id: number, companyId: number) {
  return prisma.title.findFirst({
    where: { id, companyId },
    include: { categories: true, blogPost: true },
  })
}

export async function createWithClient(client: Prisma.TransactionClient | typeof prisma, data: CreateTitleArgs) {
  if (data.categoryIds?.length) {
    await assertCategoryOwnership(client, data.companyId, data.categoryIds)
  }
  const slug = await uniqueSlug(client, data.companyId, data.titleText)
  return client.title.create({
    data: {
      companyId: data.companyId,
      title_text: data.titleText,
      seo_title: data.seoTitle,
      focus_keyword: data.focusKeyword,
      slug,
      ...(data.status ? { status: data.status } : {}),
      ...(data.categoryIds?.length
        ? {
            categories: {
              connect: data.categoryIds.map((id) => ({ id })),
            },
          }
        : {}),
    },
    include: { categories: true },
  })
}

export async function create(data: CreateTitleArgs) {
  return createWithClient(prisma, data)
}

export async function update(id: number, companyId: number, data: UpdateTitleArgs) {
  return prisma.$transaction(async (tx) => {
    if (data.categoryIds !== undefined) {
      await assertCategoryOwnership(tx, companyId, data.categoryIds)
    }
    const slug = data.titleText ? await uniqueSlug(tx, companyId, data.titleText) : undefined
    return tx.title.update({
      where: { id },
      data: {
        ...(data.titleText !== undefined
          ? {
              title_text: data.titleText,
              ...(slug ? { slug } : {}),
            }
          : {}),
        ...(data.seoTitle !== undefined ? { seo_title: data.seoTitle } : {}),
        ...(data.focusKeyword !== undefined ? { focus_keyword: data.focusKeyword } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.categoryIds !== undefined
          ? {
              categories: {
                set: data.categoryIds.map((categoryId) => ({ id: categoryId })),
              },
            }
          : {}),
      },
      include: { categories: true },
    })
  })
}

export async function remove(id: number, companyId: number) {
  const existing = await prisma.title.findFirst({ where: { id, companyId } })
  if (!existing) return null
  return prisma.title.delete({ where: { id } })
}

export async function count(companyId: number, filters: Omit<FindManyFilters, 'page' | 'pageSize'>) {
  return prisma.title.count({
    where: buildWhere(companyId, filters),
  })
}
