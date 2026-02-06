/**
 * Analytics store — ported from aurora_dashboard/stores/analytics/analyticsStore.ts
 */

import { create } from 'zustand'
import { api } from '@/lib/api'

interface AnalyticsState {
  linkedWords: Array<{ word: string; link_count: number }>
  dictionaryData: {
    total_words: number
    total_definitions: number
    isolated_words_count: number
  } | null
  blogMetaData: {
    oversized_seo_titles: Array<{ id: string; title: string }>
    oversized_meta_descriptions: Array<{ id: string; description: string }>
  } | null
  blogTitles: any[]
  generalBlogData: {
    general_seo_score: number
    score_breakdown: Record<string, number>
    [key: string]: any
  } | null
  isLoading: boolean
  error: string | null

  fetchAnalyticsData: () => Promise<void>
  clearStore: () => void
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  linkedWords: [],
  dictionaryData: null,
  blogMetaData: null,
  blogTitles: [],
  generalBlogData: null,
  isLoading: false,
  error: null,

  fetchAnalyticsData: async () => {
    set({ isLoading: true, error: null })

    try {
      const [dictionaryRes, blogMetaRes, blogTitlesRes, generalBlogRes] =
        await Promise.all([
          api('/api/aurora/analytics/dictionary/general', {
            params: { include_all_words_links: true },
          }),
          api('/api/aurora/analytics/blog/meta'),
          api('/api/aurora/blog/titles/'),
          api('/api/aurora/analytics/blog/general', {
            params: { include_recommendations: false },
          }),
        ])

      set({
        linkedWords: dictionaryRes.data?.all_words_link_count ?? [],
        dictionaryData: dictionaryRes.data
          ? {
              total_words: dictionaryRes.data.total_words ?? 0,
              total_definitions: dictionaryRes.data.total_definitions ?? 0,
              isolated_words_count: dictionaryRes.data.isolated_words_count ?? 0,
            }
          : null,
        blogMetaData: blogMetaRes.data ?? null,
        blogTitles: blogTitlesRes.data ?? [],
        generalBlogData: generalBlogRes.data ?? null,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: 'Some analytics data could not be loaded. Please try again later.',
        isLoading: false,
      })
    }
  },

  clearStore: () =>
    set({
      linkedWords: [],
      dictionaryData: null,
      blogMetaData: null,
      blogTitles: [],
      generalBlogData: null,
      isLoading: false,
      error: null,
    }),
}))
