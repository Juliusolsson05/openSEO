/**
 * Shared types — ported from aurora_dashboard/stores/blog/types.ts
 */

// Blog Post Types
export interface BlogPost {
  id: number
  elements: BlogPostElement[]
  linked_posts: LinkedPost[]
  categories: Category[]
  title_text: string
  slug: string
  seo_title: string
  meta_description: string
  excerpt: string
  focus_keyword: string
  status: number
  operation: number
  is_published: boolean
  publish: string | null
  scheduled_date: string | null
  generated_date: string
  created_at: string
  last_updated: string
  cover_image: CoverImage | null
  image_generation: boolean
  keyword_synced: boolean
  keyword_linked: boolean
  posts_synced: boolean
  reviewed: boolean
  company: number
  bulk_schedule: number
  post_linking: number[]
}

export interface BlogPostElement {
  id: number
  element_type: string
  order?: number
  content: any
  hyperlink: HyperlinkData | null
  created_at: string
  blog_post: number
  isLoading?: boolean
}

export interface LinkedPost {
  id: number
  title_text: string
  excerpt: string
  cover_image: {
    url: string
    description: string
  }
}

export interface Category {
  id: number
  name: string
}

export interface CoverImage {
  url: string
  description: string
}

export interface HyperlinkData {
  matched_keywords?: {
    text: Array<{
      keyword: string
      description: string
      matched_positions: number[]
    }>
  }
}

// Autopilot Types
export type AutopilotStage =
  | 'element_suggestions'
  | 'element_creation'
  | 'paragraph_suggestions'
  | 'paragraph_creation'
  | 'content_improvement_analysis'
  | 'content_improvement'
  | 'image_analysis'
  | 'image_generation'

export type AutopilotLogType =
  | 'status'
  | 'stage_started'
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'finished'
  | 'launched'

export interface AutopilotLog {
  timestamp: string
  stage: AutopilotStage
  type: AutopilotLogType
  data: AutopilotLogData
}

export interface AutopilotLogData {
  status?: 'started' | 'completed'
  stage?: string
  chain_id?: string
  stages?: string[]
  num_recommendations?: number
  recommendations_summary?: RecommendationSummary[]
  element_id?: number
  element_type?: string
  after_element_id?: number
  index?: number
  num_improvements?: number
  improvements_summary?: ImprovementSummary[]
  applied_tools?: string[]
  url?: string
  error?: string
  style_guide_brief?: string
  num_images?: number
  images_summary?: ImageSummary[]
}

export interface RecommendationSummary {
  element_type: string
  after_element_id: number
}

export interface ImprovementSummary {
  element_id: number
  element_type: string
  tools: string[]
}

export interface ImageSummary {
  element_id: number
}

export interface AutopilotOperation {
  elementId: number
  type: 'new' | 'enhancement' | 'regeneration'
  status: 'planned' | 'in_progress' | 'completed' | 'error'
  position?: {
    afterElementId: number
  }
  elementType?: string
  tools?: string[]
}

export interface BlogTitle {
  id: number
  title_text: string
  status: number
  dateCreated: string
  scheduledDate?: string
  bulkTag?: string
  categories?: Category[]
  generatedDate?: string
  postId?: number | null
  company: number
}
