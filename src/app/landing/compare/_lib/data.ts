import { prisma } from '@/lib/prisma'
import type { ComparisonData, ComparisonListItem } from './types'

export async function getPublishedComparisons(): Promise<ComparisonListItem[]> {
  const comparisons = await prisma.comparison.findMany({
    where: { published: true },
    orderBy: { created_at: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      created_at: true,
      tool_a: {
        select: { name: true, slug: true },
      },
      tool_b: {
        select: { name: true, slug: true },
      },
    },
  })

  return comparisons
}

export async function getComparisonBySlug(slug: string): Promise<ComparisonData | null> {
  const comparison = await prisma.comparison.findUnique({
    where: { slug, published: true },
    include: {
      tool_a: true,
      tool_b: true,
      elements: {
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!comparison) return null

  return comparison as unknown as ComparisonData
}

export async function getToolBySlug(slug: string) {
  return prisma.comparisonTool.findUnique({
    where: { slug },
  })
}
