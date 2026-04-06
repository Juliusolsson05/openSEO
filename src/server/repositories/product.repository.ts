import { Prisma } from '@prisma/client'

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

type UpsertProductInput = {
  companyId: number
  externalId: string
  data: {
    title: string
    description: string
    vendor: string
    product_type: string
    variants: Array<Prisma.ProductVariantCreateWithoutProductInput>
    images: Array<Prisma.ProductImageCreateWithoutProductInput>
    tagNames: string[]
  }
}

/**
 * Upsert a product keyed on (companyId, externalId). This is the only
 * correct way to idempotently import a Shopify (or any other external)
 * product into OpenSEO — never key on the internal autoincrement PK.
 */
export async function upsertByExternal(input: UpsertProductInput) {
  const { companyId, externalId, data } = input
  return prisma.product.upsert({
    where: { companyId_externalId: { companyId, externalId } },
    update: {
      title: data.title,
      description: data.description,
      vendor: data.vendor,
      product_type: data.product_type,
      variants: {
        deleteMany: {},
        create: data.variants.map((v) => ({ ...v, companyId })),
      },
      images: { deleteMany: {}, create: data.images },
      tags: { deleteMany: {}, create: data.tagNames.map((name) => ({ name })) },
    },
    create: {
      companyId,
      externalId,
      title: data.title,
      description: data.description,
      vendor: data.vendor,
      product_type: data.product_type,
      variants: { create: data.variants.map((v) => ({ ...v, companyId })) },
      images: { create: data.images },
      tags: { create: data.tagNames.map((name) => ({ name })) },
    },
  })
}

export function deleteProduct(id: number, companyId: number) {
  return prisma.product.deleteMany({ where: { id, companyId } })
}

export async function search(companyId: number, query: string, recencyDays?: number, amount = 10) {
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
    ...(recencyDays !== undefined
      ? {
          created_at: {
            gte: new Date(Date.now() - recencyDays * 24 * 60 * 60 * 1000),
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
