import { prisma } from '@/lib/prisma'

export function findBlogPost(companyId: number, postId: number) {
  return prisma.blogPost.findFirst({
    where: { id: postId, companyId },
    include: { elements: { orderBy: { order: 'asc' } } },
  })
}

export function findNextPendingBlogPost(companyId: number) {
  return prisma.blogPost.findFirst({
    where: { companyId, image_generation: false },
    orderBy: { id: 'asc' },
    include: { elements: { orderBy: { order: 'asc' } } },
  })
}

export function countImageGeneration(companyId: number) {
  return Promise.all([
    prisma.blogPost.count({ where: { companyId } }),
    prisma.blogPost.count({ where: { companyId, image_generation: true } }),
  ])
}

export function updateBlogPostCover(postId: number, coverImage: unknown, imageGeneration?: boolean) {
  return prisma.blogPost.update({
    where: { id: postId },
    data: {
      cover_image: coverImage as any,
      ...(imageGeneration !== undefined ? { image_generation: imageGeneration } : {}),
    },
  })
}

export function updateElementContent(elementId: number, content: unknown) {
  return prisma.blogPostElement.update({
    where: { id: elementId },
    data: { content: content as any },
  })
}
