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

function uniqueSlug(base: string, companyId: number) {
  const cleaned = slugify(base) || 'category'
  return `${cleaned}-${companyId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
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

export async function create(companyId: number, data: CreateCategoryArgs) {
  return prisma.category.create({
    data: {
      companyId,
      name: data.name,
      slug: uniqueSlug(data.name, companyId),
    },
  })
}

export async function update(id: number, data: UpdateCategoryArgs) {
  const existing = await prisma.category.findUnique({ where: { id } })
  if (!existing) return null

  return prisma.category.update({
    where: { id },
    data: {
      ...(data.name !== undefined
        ? {
            name: data.name,
            slug: uniqueSlug(data.name, existing.companyId ?? 0),
          }
        : {}),
    },
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
