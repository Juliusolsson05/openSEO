import { create } from 'zustand'
import { api } from '@/lib/api'

interface AnalyticsMetric {
  value: number
  value_description: string
  computation_method: string
  value_recommendation?: string
}

interface ScoreBreakdownItem {
  score: number
  weight: number
}

export interface BlogGeneralResponse {
  total_blog_posts: AnalyticsMetric
  published_blog_posts: AnalyticsMetric
  average_post_length: AnalyticsMetric
  average_keyword_density: AnalyticsMetric
  average_link_density: AnalyticsMetric
  average_total_links: AnalyticsMetric
  average_internal_links: AnalyticsMetric
  average_outgoing_links: AnalyticsMetric
  average_tool_recommendations: AnalyticsMetric
  average_case_studies: AnalyticsMetric
  focus_keywords: string[]
  general_seo_score: number
  score_breakdown: Record<string, ScoreBreakdownItem>
}

interface OversizedSeoTitle {
  post_id: number
  title: string
  focus_keyword: string
  extra_chars: number
}

interface OversizedMetaDescription {
  post_id: number
  meta_description: string
  focus_keyword: string
  extra_chars: number
}

export interface BlogMetaResponse {
  avg_meta_description_length: number
  avg_seo_title_length: number
  focus_keyword_density_meta: number
  focus_keyword_density_seo_title: number
  oversized_seo_titles: OversizedSeoTitle[]
  oversized_meta_descriptions: OversizedMetaDescription[]
}

interface DictionaryWordCount {
  word: string
  link_count: number
}

export interface DictionaryGeneralResponse {
  total_words: number
  total_definitions: number
  total_hyperlinks: number
  most_linked_words: DictionaryWordCount[]
  isolated_words_count: number
  isolated_words: string[]
  all_words_link_count: DictionaryWordCount[]
  words_per_letter: Record<string, number>
  high_priority_words: number
  low_priority_words: number
}

export interface BlogTitle {
  id: number
  title_text: string
  generated_date: string | null
  categories: Array<{ id: number; name: string }>
  post_linking: number[]
}

interface AnalyticsState {
  linkedWords: DictionaryWordCount[]
  dictionaryData: DictionaryGeneralResponse | null
  blogMetaData: BlogMetaResponse | null
  blogTitles: BlogTitle[]
  generalBlogData: BlogGeneralResponse | null
  isLoading: boolean
  error: string | null
  fetchPromise: Promise<void> | null

  hasGeneralData: () => boolean
  hasBlogTitles: () => boolean
  hasDictionaryData: () => boolean
  hasBlogMetaData: () => boolean
  hasData: () => boolean

  fetchAnalyticsData: () => Promise<void>
  clearStore: () => void
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  linkedWords: [],
  dictionaryData: null,
  blogMetaData: null,
  blogTitles: [],
  generalBlogData: null,
  isLoading: false,
  error: null,
  fetchPromise: null,

  hasGeneralData: () => Boolean(get().generalBlogData),
  hasBlogTitles: () => get().blogTitles.length > 0,
  hasDictionaryData: () => Boolean(get().dictionaryData),
  hasBlogMetaData: () => Boolean(get().blogMetaData),
  hasData: () => {
    const state = get()
    return state.hasGeneralData() || state.hasBlogTitles() || state.hasDictionaryData() || state.hasBlogMetaData()
  },

  fetchAnalyticsData: async () => {
    const existing = get().fetchPromise
    if (existing) return existing

    const fetcher = (async () => {
      set({ isLoading: true, error: null })

      try {
        const [dictionaryRes, blogMetaRes, blogTitlesRes, generalBlogRes] = await Promise.all([
          api<DictionaryGeneralResponse>('/api/aurora/analytics/dictionary/general', {
            params: { include_all_words_links: 'true' },
          }).catch(() => ({ data: null, error: new Error('dictionary failed') })),
          api<BlogMetaResponse>('/api/aurora/analytics/blog/meta')
            .catch(() => ({ data: null, error: new Error('meta failed') })),
          api<BlogTitle[]>('/api/aurora/blog/titles/')
            .catch(() => ({ data: null, error: new Error('titles failed') })),
          api<BlogGeneralResponse>('/api/aurora/analytics/blog/general', {
            params: { include_recommendations: 'false' },
          }).catch(() => ({ data: null, error: new Error('general failed') })),
        ])

        const hasAnyData = dictionaryRes.data || blogMetaRes.data || blogTitlesRes.data || generalBlogRes.data
        const allFailed = !hasAnyData

        set({
          linkedWords: dictionaryRes.data?.all_words_link_count ?? [],
          dictionaryData: dictionaryRes.data ?? null,
          blogMetaData: blogMetaRes.data ?? null,
          blogTitles: blogTitlesRes.data ?? [],
          generalBlogData: generalBlogRes.data ?? null,
          isLoading: false,
          error: allFailed ? 'Could not load analytics data. Please check your connection and try again.' : null,
          fetchPromise: null,
        })
      } catch {
        set({
          error: 'Some analytics data could not be loaded. Please try again later.',
          isLoading: false,
          fetchPromise: null,
        })
      }
    })()

    set({ fetchPromise: fetcher })
    return fetcher
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
      fetchPromise: null,
    }),
}))
