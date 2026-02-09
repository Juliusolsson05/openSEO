/**
 * Analytics types — shared across analytics components and store.
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

export interface BlogMetaData {
  avg_meta_description_length: number
  avg_seo_title_length: number
  focus_keyword_density_meta: number
  focus_keyword_density_seo_title: number
  oversized_seo_titles: OversizedSeoTitle[]
  oversized_meta_descriptions: OversizedMetaDescription[]
}
