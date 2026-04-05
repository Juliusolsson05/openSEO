import { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'

type ListBlogPostsFilters = {
  page: number
  pageSize: number
  status?: 'TO_BE_GENERATED' | 'APPROVED' | 'REJECTED' | 'GENERATED' | 'PUBLISHED'
  search?: string
  categoryIds?: number[]
  publishStatus?: 'published' | 'drafts' | 'all'
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
    ...(filters.categoryIds?.length
      ? {
          categories: {
            some: {
              id: {
                in: filters.categoryIds,
              },
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
    ...(filters.publishStatus === 'published'
      ? {
          publishes: {
            some: {
              remote_id: {
                not: null,
              },
            },
          },
        }
      : {}),
    ...(filters.publishStatus === 'drafts'
      ? {
          publishes: {
            none: {
              remote_id: {
                not: null,
              },
            },
          },
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

function withIsPublished<T extends { publishes: Array<{ remote_id: string | null }>; post_linking_from?: Array<{ toBlogPost: { id: number; title_text: string; excerpt: string | null; cover_image: unknown } }> }>(post: T) {
  const linked_posts = (post.post_linking_from ?? []).map((link) => ({
    id: link.toBlogPost.id,
    title_text: link.toBlogPost.title_text,
    excerpt: link.toBlogPost.excerpt ?? '',
    cover_image: link.toBlogPost.cover_image ?? { url: '', description: '' },
  }))

  return {
    ...post,
    is_published: post.publishes.some((publish) => publish.remote_id !== null),
    linked_posts,
  }
}

const blogPostInclude = {
  categories: true,
  publishes: {
    orderBy: {
      sync_date: 'desc' as const,
    },
  },
  elements: {
    orderBy: {
      order: 'asc' as const,
    },
    include: {
      hyperlink: true,
    },
  },
  post_linking_from: {
    where: {
      toBlogPost: { status: { in: ['GENERATED', 'PUBLISHED'] } },
    },
    include: {
      toBlogPost: {
        select: {
          id: true,
          title_text: true,
          excerpt: true,
          cover_image: true,
        },
      },
    },
  },
} satisfies Prisma.BlogPostInclude

export async function findMany(companyId: number, filters: ListBlogPostsFilters) {
  const where = buildWhere(companyId, {
    status: filters.status,
    search: filters.search,
    categoryIds: filters.categoryIds,
    publishStatus: filters.publishStatus,
  })

  const posts = await prisma.blogPost.findMany({
    where,
    skip: (filters.page - 1) * filters.pageSize,
    take: filters.pageSize,
    orderBy: buildOrderBy(filters.sort),
    include: blogPostInclude,
  })

  return posts.map(withIsPublished)
}

export async function findById(id: number, companyId: number) {
  const post = await prisma.blogPost.findFirst({
    where: {
      id,
      companyId,
    },
    include: blogPostInclude,
  })

  return post ? withIsPublished(post) : null
}

export async function findBySlug(companyId: number, slug: string) {
  return prisma.blogPost.findUnique({
    where: { companyId_slug: { companyId, slug } },
    select: { id: true, slug: true },
  })
}

export async function create(data: Prisma.BlogPostCreateInput) {
  const post = await prisma.blogPost.create({
    data,
    include: blogPostInclude,
  })

  return withIsPublished(post)
}

export async function update(id: number, data: Prisma.BlogPostUpdateInput) {
  const post = await prisma.blogPost.update({
    where: { id },
    data,
    include: blogPostInclude,
  })

  return withIsPublished(post)
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

export async function listFocusKeywords(companyId: number) {
  const rows = await prisma.blogPost.findMany({
    where: {
      companyId,
      focus_keyword: {
        not: null,
      },
    },
    select: {
      focus_keyword: true,
    },
    distinct: ['focus_keyword'],
    orderBy: {
      focus_keyword: 'asc',
    },
  })

  return rows
    .map((row) => row.focus_keyword)
    .filter((value): value is string => Boolean(value))
}
