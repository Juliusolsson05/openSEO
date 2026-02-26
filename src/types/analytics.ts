/**
 * Analytics types — single source of truth for all analytics domain types.
 */

export interface AnalyticsMetric {
  value: number
  value_description?: string
  computation_method?: string
  value_recommendation?: string
}

export interface ScoreBreakdownItem {
  score: number
  weight: number
}

// ─── Blog general analytics ──────────────────────────────────────────────────

/** Component-friendly shape — all fields optional (defensive). */
export interface BlogGeneralData {
  total_blog_posts?: AnalyticsMetric
  published_blog_posts?: AnalyticsMetric
  average_post_length?: AnalyticsMetric
  average_keyword_density?: AnalyticsMetric
  average_link_density?: AnalyticsMetric
  average_total_links?: AnalyticsMetric
  average_internal_links?: AnalyticsMetric
  average_outgoing_links?: AnalyticsMetric
  average_tool_recommendations?: AnalyticsMetric
  average_case_studies?: AnalyticsMetric
  focus_keywords?: string[]
  general_seo_score?: number
  score_breakdown?: Record<string, ScoreBreakdownItem>
}

/** API response shape — required fields (matches backend contract). */
export interface BlogGeneralResponse extends BlogGeneralData {
  total_blog_posts: AnalyticsMetric
  published_blog_posts: AnalyticsMetric
  average_post_length: AnalyticsMetric
  general_seo_score: number
  score_breakdown: Record<string, ScoreBreakdownItem>
  focus_keywords: string[]
}

// ─── Blog meta analytics ─────────────────────────────────────────────────────

export interface OversizedSeoTitle {
  post_id: number
  title: string
  focus_keyword: string
  extra_chars: number
}

export interface OversizedMetaDescription {
  post_id: number
  meta_description: string
  focus_keyword: string
  extra_chars: number
}

/** Component-friendly shape (alias kept for backwards compat). */
export interface BlogMetaData {
  avg_meta_description_length: number
  avg_seo_title_length: number
  focus_keyword_density_meta: number
  focus_keyword_density_seo_title: number
  oversized_seo_titles: OversizedSeoTitle[]
  oversized_meta_descriptions: OversizedMetaDescription[]
}

/** API response shape (alias for BlogMetaData — same structure). */
export type BlogMetaResponse = BlogMetaData

// ─── Dictionary analytics ────────────────────────────────────────────────────

export interface DictionaryWordCount {
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

// ─── Titles / network analytics ──────────────────────────────────────────────

export interface AnalyticsBlogTitle {
  id: number
  title_text: string
  generated_date: string | null
  categories: Array<{ id: number; name: string }>
  post_linking: number[]
}

// ─── Element analytics ───────────────────────────────────────────────────────

export interface ElementBreakdownResponse {
  total_posts: number
  element_counts: Record<string, number>
  total_elements_per_post: number[]
}

// ─── Aggregated analytics state ──────────────────────────────────────────────

export interface AnalyticsData {
  dictionaryData: DictionaryGeneralResponse | null
  blogMetaData: BlogMetaResponse | null
  blogTitles: AnalyticsBlogTitle[]
  generalBlogData: BlogGeneralResponse | null
  elementBreakdown: ElementBreakdownResponse | null
  linkedWords: DictionaryWordCount[]
}
