import { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'

type CreateCategoryArgs = {
  name: string
}

type UpdateCategoryArgs = {
  name?: string
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function uniqueSlug(client: Prisma.TransactionClient | typeof prisma, base: string, companyId: number) {
  const cleaned = slugify(base) || 'category'
  let idx = 0
  while (true) {
    const candidate = idx === 0 ? cleaned : `${cleaned}-${idx}`
    const exists = await client.category.findUnique({
      where: { companyId_slug: { companyId, slug: candidate } },
      select: { id: true },
    })
    if (!exists) return candidate
    idx += 1
  }
}

export async function findMany(companyId: number) {
  return prisma.category.findMany({
    where: { companyId },
    orderBy: { created_at: 'desc' },
    include: {
      _count: {
        select: {
          blog_posts: true,
          titles: true,
        },
      },
    },
  })
}

export async function findById(id: number) {
  return prisma.category.findUnique({ where: { id } })
}

export async function findOrCreateByName(client: Prisma.TransactionClient, companyId: number, name: string) {
  const existing = await client.category.findUnique({
    where: { companyId_name: { companyId, name } },
  })
  if (existing) return { created: false, category: existing }
  const slug = await uniqueSlug(client, name, companyId)
  const category = await client.category.create({ data: { companyId, name, slug } })
  return { created: true, category }
}

export async function create(companyId: number, data: CreateCategoryArgs) {
  return prisma.$transaction(async (tx) => {
    const slug = await uniqueSlug(tx, data.name, companyId)
    return tx.category.create({
      data: {
        companyId,
        name: data.name,
        slug,
      },
    })
  })
}

export async function update(id: number, data: UpdateCategoryArgs) {
  const existing = await prisma.category.findUnique({ where: { id } })
  if (!existing) return null

  return prisma.$transaction(async (tx) => {
    const slug = data.name !== undefined ? await uniqueSlug(tx, data.name, existing.companyId ?? 0) : undefined
    return tx.category.update({
      where: { id },
      data: {
        ...(data.name !== undefined
          ? {
              name: data.name,
              ...(slug ? { slug } : {}),
            }
          : {}),
      },
    })
  })
}

export async function remove(id: number) {
  return prisma.category.delete({ where: { id } })
}

export async function bulkDelete(ids: number[]) {
  return prisma.category.deleteMany({
    where: { id: { in: ids } },
  })
}
