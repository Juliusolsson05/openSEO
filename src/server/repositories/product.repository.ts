import { prisma } from '@/lib/prisma'

type FindManyFilters = {
  search?: string
  ageDays?: number
  page: number
  pageSize: number
}

export async function findMany(companyId: number, filters: FindManyFilters) {
  const where = {
    companyId,
    ...(filters.search
      ? {
          OR: [
            { title: { contains: filters.search, mode: 'insensitive' as const } },
            { description: { contains: filters.search, mode: 'insensitive' as const } },
            { tags: { some: { name: { contains: filters.search, mode: 'insensitive' as const } } } },
          ],
        }
      : {}),
    ...(filters.ageDays !== undefined
      ? {
          created_at: {
            gte: new Date(Date.now() - filters.ageDays * 24 * 60 * 60 * 1000),
          },
        }
      : {}),
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
      include: { variants: true, images: true, tags: true },
      orderBy: { created_at: 'desc' },
    }),
    prisma.product.count({ where }),
  ])

  return { items, total }
}

export function findById(id: number, companyId: number) {
  return prisma.product.findFirst({
    where: { id, companyId },
    include: { variants: true, images: true, tags: true },
  })
}

export async function bulkCreate(products: Parameters<typeof prisma.product.upsert>[0][]) {
  return Promise.all(products.map((product) => prisma.product.upsert(product)))
}

export function deleteProduct(id: number, companyId: number) {
  return prisma.product.deleteMany({ where: { id, companyId } })
}

export async function search(companyId: number, query: string, age?: number, amount = 10) {
  const where = {
    companyId,
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: 'insensitive' as const } },
            { description: { contains: query, mode: 'insensitive' as const } },
            { vendor: { contains: query, mode: 'insensitive' as const } },
            { product_type: { contains: query, mode: 'insensitive' as const } },
            { tags: { some: { name: { contains: query, mode: 'insensitive' as const } } } },
          ],
        }
      : {}),
    ...(age !== undefined
      ? {
          created_at: {
            gte: new Date(Date.now() - age * 24 * 60 * 60 * 1000),
          },
        }
      : {}),
  }

  return prisma.product.findMany({
    where,
    take: amount,
    orderBy: [{ updated_at: 'desc' }, { created_at: 'desc' }],
    include: { variants: true, images: true, tags: true },
  })
}
