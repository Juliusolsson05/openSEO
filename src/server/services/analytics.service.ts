import type { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'
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
    const dictionaryCount = await prisma.dictionary.count({ where: { companyId } })
    if (!dictionaryCount) {
      return {
        total_words: 0,
        total_definitions: 0,
        total_hyperlinks: 0,
        most_linked_words: [],
        isolated_words_count: 0,
        isolated_words: [],
        all_words_link_count: [],
        words_per_letter: {},
        high_priority_words: 0,
        low_priority_words: 0,
      }
    }

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
