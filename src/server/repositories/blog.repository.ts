import { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'

type ListBlogPostsFilters = {
  page: number
  pageSize: number
  status?: 'TO_BE_GENERATED' | 'APPROVED' | 'REJECTED' | 'GENERATED'
  search?: string
  categoryId?: number
  sort?:
    | 'createdAtDesc'
    | 'createdAtAsc'
    | 'updatedAtDesc'
    | 'updatedAtAsc'
    | 'scheduledDateDesc'
    | 'scheduledDateAsc'
}

function buildWhere(companyId: number, filters: Omit<ListBlogPostsFilters, 'page' | 'pageSize' | 'sort'>): Prisma.BlogPostWhereInput {
  return {
    companyId,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.categoryId
      ? {
          categories: {
            some: {
              id: filters.categoryId,
            },
          },
        }
      : {}),
    ...(filters.search
      ? {
          OR: [
            { title_text: { contains: filters.search, mode: 'insensitive' } },
            { seo_title: { contains: filters.search, mode: 'insensitive' } },
            { focus_keyword: { contains: filters.search, mode: 'insensitive' } },
            { excerpt: { contains: filters.search, mode: 'insensitive' } },
            { meta_description: { contains: filters.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  }
}

function buildOrderBy(sort: ListBlogPostsFilters['sort']): Prisma.BlogPostOrderByWithRelationInput {
  switch (sort) {
    case 'createdAtAsc':
      return { created_at: 'asc' }
    case 'updatedAtDesc':
      return { last_updated: 'desc' }
    case 'updatedAtAsc':
      return { last_updated: 'asc' }
    case 'scheduledDateDesc':
      return { scheduled_date: 'desc' }
    case 'scheduledDateAsc':
      return { scheduled_date: 'asc' }
    case 'createdAtDesc':
    default:
      return { created_at: 'desc' }
  }
}

export async function findMany(companyId: number, filters: ListBlogPostsFilters) {
  const where = buildWhere(companyId, {
    status: filters.status,
    search: filters.search,
    categoryId: filters.categoryId,
  })

  return prisma.blogPost.findMany({
    where,
    skip: (filters.page - 1) * filters.pageSize,
    take: filters.pageSize,
    orderBy: buildOrderBy(filters.sort),
    include: {
      categories: true,
      publishes: true,
    },
  })
}

export async function findById(id: number, companyId: number) {
  return prisma.blogPost.findFirst({
    where: {
      id,
      companyId,
    },
    include: {
      categories: true,
      publishes: true,
      elements: {
        orderBy: {
          order: 'asc',
        },
        include: {
          hyperlink: true,
        },
      },
    },
  })
}

export async function findBySlug(slug: string) {
  return prisma.blogPost.findUnique({
    where: { slug },
    select: { id: true, slug: true },
  })
}

export async function create(data: Prisma.BlogPostCreateInput) {
  return prisma.blogPost.create({
    data,
    include: {
      categories: true,
      publishes: true,
      elements: {
        orderBy: {
          order: 'asc',
        },
        include: {
          hyperlink: true,
        },
      },
    },
  })
}

export async function update(id: number, data: Prisma.BlogPostUpdateInput) {
  return prisma.blogPost.update({
    where: { id },
    data,
    include: {
      categories: true,
      publishes: true,
      elements: {
        orderBy: {
          order: 'asc',
        },
        include: {
          hyperlink: true,
        },
      },
    },
  })
}

export async function deletePost(id: number, companyId: number) {
  const result = await prisma.blogPost.deleteMany({
    where: {
      id,
      companyId,
    },
  })

  return result.count > 0
}

export async function count(companyId: number, filters: Omit<ListBlogPostsFilters, 'page' | 'pageSize' | 'sort'>) {
  const where = buildWhere(companyId, filters)
  return prisma.blogPost.count({ where })
}
