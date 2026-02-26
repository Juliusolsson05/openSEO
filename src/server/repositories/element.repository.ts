import { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'

type CreateElementArgs = {
  blogPostId: number
  elementType: string
  content: Prisma.InputJsonValue
  order?: number
}

type UpdateElementArgs = {
  elementType?: string
  content?: Prisma.InputJsonValue
  order?: number
}

export async function findByBlogPostId(blogPostId: number) {
  return prisma.blogPostElement.findMany({
    where: { blogPostId },
    orderBy: { order: 'asc' },
  })
}

export async function findById(id: number) {
  return prisma.blogPostElement.findUnique({
    where: { id },
    include: { blog_post: true },
  })
}

export async function create(data: CreateElementArgs) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.blogPostElement.findMany({
      where: { blogPostId: data.blogPostId },
      select: { order: true },
      orderBy: { order: 'asc' },
    })

    const maxOrder = existing.length > 0 ? existing[existing.length - 1].order : -1
    const targetOrder = data.order === undefined ? maxOrder + 1 : Math.max(0, Math.min(data.order, maxOrder + 1))

    await tx.blogPostElement.updateMany({
      where: {
        blogPostId: data.blogPostId,
        order: { gte: targetOrder },
      },
      data: { order: { increment: 1 } },
    })

    return tx.blogPostElement.create({
      data: {
        blogPostId: data.blogPostId,
        element_type: data.elementType,
        content: data.content,
        order: targetOrder,
      },
    })
  })
}

export async function update(id: number, data: UpdateElementArgs) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.blogPostElement.findUnique({ where: { id } })
    if (!existing) return null

    let nextOrder = existing.order

    if (data.order !== undefined && data.order !== existing.order) {
      const count = await tx.blogPostElement.count({ where: { blogPostId: existing.blogPostId } })
      const clampedOrder = Math.max(0, Math.min(data.order, Math.max(0, count - 1)))

      if (clampedOrder > existing.order) {
        await tx.blogPostElement.updateMany({
          where: {
            blogPostId: existing.blogPostId,
            order: { gt: existing.order, lte: clampedOrder },
          },
          data: { order: { decrement: 1 } },
        })
      } else {
        await tx.blogPostElement.updateMany({
          where: {
            blogPostId: existing.blogPostId,
            order: { gte: clampedOrder, lt: existing.order },
          },
          data: { order: { increment: 1 } },
        })
      }

      nextOrder = clampedOrder
    }

    return tx.blogPostElement.update({
      where: { id },
      data: {
        ...(data.elementType ? { element_type: data.elementType } : {}),
        ...(data.content !== undefined ? { content: data.content } : {}),
        order: nextOrder,
      },
    })
  })
}

export async function remove(id: number) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.blogPostElement.findUnique({ where: { id } })
    if (!existing) return null

    await tx.blogPostElement.delete({ where: { id } })

    await tx.blogPostElement.updateMany({
      where: {
        blogPostId: existing.blogPostId,
        order: { gt: existing.order },
      },
      data: { order: { decrement: 1 } },
    })

    return existing
  })
}

export async function reorder(blogPostId: number, elementIds: number[]) {
  return prisma.$transaction(async (tx) => {
    await Promise.all(
      elementIds.map((elementId, index) =>
        tx.blogPostElement.updateMany({
          where: { id: elementId, blogPostId },
          data: { order: index },
        })
      )
    )

    return tx.blogPostElement.findMany({
      where: { blogPostId },
      orderBy: { order: 'asc' },
    })
  })
}
