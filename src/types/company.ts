/**
 * Company domain types — used by company profile pages and hooks.
 */

export type CompanyProfile = {
  business_description: string
  industry: string
  target_audience: string
  tone_of_voice: string[]
  products_services: string[]
  key_terminology: string[]
  content_topics: string[]
  differentiators: string[]
  detected_language: string
  _scraped_at?: string
  _pages_analyzed?: number
}

export type CompanyProfileResponse = {
  website_url: string | null
  profile: CompanyProfile | null
  name: string
  business_type: string
  language: string
  keywords: unknown
}

export type AnalyzeResponse = { task_id: string; status: string }
