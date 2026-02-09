/**
 * Core blog domain types — single source of truth.
 *
 * Imported by stores, dashboard pages, analytics components, and services.
 */

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
