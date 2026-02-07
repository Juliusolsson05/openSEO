import type { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'

export function findBlogPost(companyId: number, blogPostId: number) {
  return prisma.blogPost.findFirst({
    where: { id: blogPostId, companyId },
    include: {
      elements: { orderBy: { order: 'asc' } },
      categories: true,
    },
  })
}

export function createBlogPostAnalysisLog(data: Prisma.QuilloBlogPostAnalysisLogUncheckedCreateInput) {
  return prisma.quilloBlogPostAnalysisLog.create({ data })
}

export function findLatestBlogPostAnalysis(companyId: number, blogPostId: number) {
  return prisma.quilloBlogPostAnalysisLog.findFirst({
    where: { companyId, blogPostId },
    orderBy: { created_at: 'desc' },
  })
}

export function findLatestAnalytics(companyId: number) {
  return prisma.analyticsLog.findFirst({
    where: { companyId },
    orderBy: { last_synced: 'desc' },
  })
}

export function findLatestCompanyAnalysis(companyId: number) {
  return prisma.quilloCompanyAnalysisLog.findFirst({
    where: { companyId },
    include: { analytics_log: true },
    orderBy: { created_at: 'desc' },
  })
}

export function createCompanyAnalysisLog(data: Prisma.QuilloCompanyAnalysisLogUncheckedCreateInput) {
  return prisma.quilloCompanyAnalysisLog.create({ data })
}
