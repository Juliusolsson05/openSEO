import type { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'

export function getLatestLog(companyId: number) {
  return prisma.analyticsLog.findFirst({
    where: { companyId },
    orderBy: { created_at: 'desc' },
  })
}

export function createLog(data: { companyId: number; json_data: Prisma.InputJsonValue; last_synced?: Date }) {
  return prisma.analyticsLog.create({
    data: {
      companyId: data.companyId,
      json_data: data.json_data as Prisma.InputJsonValue,
      ...(data.last_synced ? { last_synced: data.last_synced } : {}),
    },
  })
}

function collectReadabilityScores(input: unknown, scores: number[] = []): number[] {
  if (Array.isArray(input)) {
    input.forEach((item) => collectReadabilityScores(item, scores))
    return scores
  }

  if (input && typeof input === 'object') {
    const record = input as Record<string, unknown>
    for (const [key, value] of Object.entries(record)) {
      if (typeof value === 'number' && key.toLowerCase().includes('readability')) {
        scores.push(value)
      } else {
        collectReadabilityScores(value, scores)
      }
    }
  }

  return scores
}

export async function getBlogPostReadability(companyId: number) {
  const elements = await prisma.blogPostElement.findMany({
    where: { blog_post: { companyId } },
    select: { blogPostId: true, content: true },
  })

  const byPost = new Map<number, number[]>()

  for (const element of elements) {
    const scores = collectReadabilityScores(element.content)
    if (!scores.length) continue

    const existing = byPost.get(element.blogPostId) ?? []
    existing.push(...scores)
    byPost.set(element.blogPostId, existing)
  }

  const posts = [...byPost.entries()].map(([blogPostId, scores]) => ({
    blogPostId,
    score: scores.reduce((sum, value) => sum + value, 0) / scores.length,
    samples: scores.length,
  }))

  const allScores = posts.flatMap((post) => post.score)
  const average = allScores.length ? allScores.reduce((sum, value) => sum + value, 0) / allScores.length : null

  return {
    average,
    posts,
  }
}

export async function getGeneralBlogAnalytics(companyId: number) {
  const [totalPosts, publishedPosts, reviewedPosts, byStatus, byCategory] = await Promise.all([
    prisma.blogPost.count({ where: { companyId } }),
    prisma.blogPublish.count({ where: { blog_post: { companyId } } }),
    prisma.blogPost.count({ where: { companyId, reviewed: true } }),
    prisma.blogPost.groupBy({ by: ['status'], where: { companyId }, _count: { _all: true } }),
    prisma.category.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        _count: { select: { blog_posts: true } },
      },
    }),
  ])

  return {
    totalPosts,
    publishedPosts,
    reviewedPosts,
    statuses: byStatus.map((s) => ({ status: s.status, count: s._count._all })),
    categories: byCategory.map((c) => ({ id: c.id, name: c.name, count: c._count.blog_posts })),
  }
}

export async function getMetaAnalysis(companyId: number) {
  const [totalPosts, withMetaDescription, withSeoTitle] = await Promise.all([
    prisma.blogPost.count({ where: { companyId } }),
    prisma.blogPost.count({ where: { companyId, NOT: { meta_description: null } } }),
    prisma.blogPost.count({ where: { companyId, NOT: { seo_title: null } } }),
  ])

  return {
    totalPosts,
    withMetaDescription,
    withSeoTitle,
    missingMetaDescription: totalPosts - withMetaDescription,
    missingSeoTitle: totalPosts - withSeoTitle,
  }
}

export async function getElementCounts(companyId: number) {
  const grouped = await prisma.blogPostElement.groupBy({
    by: ['element_type'],
    where: { blog_post: { companyId } },
    _count: { _all: true },
  })

  return grouped.map((entry) => ({
    elementType: entry.element_type,
    count: entry._count._all,
  }))
}

export async function getDictionaryAnalytics(companyId: number) {
  const [dictionaryCount, wordCount, definitionCount] = await Promise.all([
    prisma.dictionary.count({ where: { companyId } }),
    prisma.word.count({ where: { dictionary: { companyId } } }),
    prisma.dictionaryDefinition.count({ where: { word: { dictionary: { companyId } } } }),
  ])

  return {
    dictionaryCount,
    wordCount,
    definitionCount,
    definitionCoverage: wordCount ? definitionCount / wordCount : 0,
  }
}
