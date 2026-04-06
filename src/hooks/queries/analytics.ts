'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAllTitlesQuery } from '@/hooks/queries/titles'
import type {
  BlogGeneralResponse,
  BlogMetaResponse,
  DictionaryGeneralResponse,
  AnalyticsBlogTitle,
  ElementBreakdownResponse,
  AnalyticsData,
} from '@/types/analytics'

export function useAnalyticsQuery() {
  const dictionaryQ = useQuery({
    queryKey: ['analytics', 'dictionary'] as const,
    queryFn: async () => {
      return api<DictionaryGeneralResponse>(
        '/api/aurora/analytics/dictionary/general',
        { params: { include_all_words_links: 'true' } },
      )
    },
  })

  const blogMetaQ = useQuery({
    queryKey: ['analytics', 'blog-meta'] as const,
    queryFn: async () => {
      return api<BlogMetaResponse>('/api/aurora/analytics/blog/meta')
    },
  })

  const generalBlogQ = useQuery({
    queryKey: ['analytics', 'blog-general'] as const,
    queryFn: async () => {
      return api<BlogGeneralResponse>(
        '/api/aurora/analytics/blog/general',
        { params: { include_recommendations: 'false' } },
      )
    },
  })

  const elementsQ = useQuery({
    queryKey: ['analytics', 'blog-elements'] as const,
    queryFn: async () => {
      return api<ElementBreakdownResponse>(
        '/api/aurora/analytics/blog/elements',
      )
    },
  })

  const titlesQ = useAllTitlesQuery()

  const isLoading =
    dictionaryQ.isLoading ||
    blogMetaQ.isLoading ||
    generalBlogQ.isLoading ||
    elementsQ.isLoading ||
    titlesQ.isLoading

  const hasErrors =
    dictionaryQ.isError ||
    blogMetaQ.isError ||
    generalBlogQ.isError ||
    elementsQ.isError ||
    titlesQ.isError

  const refetch = () => {
    void dictionaryQ.refetch()
    void blogMetaQ.refetch()
    void generalBlogQ.refetch()
    void elementsQ.refetch()
    void titlesQ.refetch()
  }

  const data: AnalyticsData = {
    dictionaryData: dictionaryQ.data ?? null,
    blogMetaData: blogMetaQ.data ?? null,
    blogTitles: (titlesQ.data ?? []) as unknown as AnalyticsBlogTitle[],
    generalBlogData: generalBlogQ.data ?? null,
    elementBreakdown: elementsQ.data ?? null,
    linkedWords: dictionaryQ.data?.all_words_link_count ?? [],
  }

  return { data, isLoading, hasErrors, refetch }
}
