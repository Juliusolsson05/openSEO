import type { Prisma } from '@prisma/client'

import * as analyticsRepository from '@/server/repositories/analytics.repository'

export class AnalyticsService {
  async getReadabilityAnalytics(companyId: number, blogPostId?: number) {
    return analyticsRepository.getBlogPostReadability(companyId, blogPostId)
  }

  async getGeneralAnalytics(companyId: number, includeRecommendations = true) {
    return analyticsRepository.getGeneralBlogAnalytics(companyId, includeRecommendations)
  }

  async getMetaAnalytics(companyId: number) {
    return analyticsRepository.getMetaAnalysis(companyId)
  }

  async getElementAnalytics(companyId: number) {
    return analyticsRepository.getElementCounts(companyId)
  }

  async getDictionaryAnalytics(companyId: number, includeAllWordsLinks = false) {
    return analyticsRepository.getDictionaryAnalytics(companyId, includeAllWordsLinks)
  }

  async getLatestLog(companyId: number) {
    return analyticsRepository.getLatestLog(companyId)
  }

  async createLog(companyId: number, jsonData: Prisma.InputJsonValue) {
    return analyticsRepository.createLog({ companyId, json_data: jsonData })
  }
}

export const analyticsService = new AnalyticsService()
