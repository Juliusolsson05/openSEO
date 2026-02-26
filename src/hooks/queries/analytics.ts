'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { QK } from '@/lib/query-keys'
import type {
  BlogGeneralResponse,
  BlogMetaResponse,
  DictionaryGeneralResponse,
  AnalyticsBlogTitle,
  ElementBreakdownResponse,
  AnalyticsData,
  DictionaryWordCount,
} from '@/types/analytics'

export function useAnalyticsQuery() {
  return useQuery({
    queryKey: QK.analytics(),
    queryFn: async (): Promise<AnalyticsData> => {
      const [dictionaryRes, blogMetaRes, blogTitlesRes, generalBlogRes, elementsRes] =
        await Promise.allSettled([
          api<DictionaryGeneralResponse>('/api/aurora/analytics/dictionary/general', {
            params: { include_all_words_links: 'true' },
          }),
          api<BlogMetaResponse>('/api/aurora/analytics/blog/meta'),
          api<{ data: AnalyticsBlogTitle[]; total: number } | AnalyticsBlogTitle[]>(
            '/api/aurora/blog/titles/'
          ),
          api<BlogGeneralResponse>('/api/aurora/analytics/blog/general', {
            params: { include_recommendations: 'false' },
          }),
          api<ElementBreakdownResponse>('/api/aurora/analytics/blog/elements'),
        ])

      const getVal = <T>(
        r: PromiseSettledResult<{ data: T | null; error: any }>
      ): T | null =>
        r.status === 'fulfilled' && !r.value.error ? r.value.data : null

      const dictionaryData = getVal<DictionaryGeneralResponse>(dictionaryRes)
      const blogMetaData = getVal<BlogMetaResponse>(blogMetaRes)
      const rawTitles = getVal<
        { data: AnalyticsBlogTitle[]; total: number } | AnalyticsBlogTitle[]
      >(blogTitlesRes)
      const generalBlogData = getVal<BlogGeneralResponse>(generalBlogRes)
      const elementBreakdown = getVal<ElementBreakdownResponse>(elementsRes)

      const blogTitles: AnalyticsBlogTitle[] = Array.isArray(rawTitles)
        ? rawTitles
        : (rawTitles?.data ?? [])

      return {
        dictionaryData,
        blogMetaData,
        blogTitles,
        generalBlogData,
        elementBreakdown,
        linkedWords: dictionaryData?.all_words_link_count ?? [],
      }
    },
  })
}
