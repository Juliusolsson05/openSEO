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
      matched_positions: Array<[number, number]>
    }>
  }
}

export interface BlogPostElement {
  /**
   * Real server-assigned elements use a numeric id. Client-only skeleton
   * placeholders inserted before the server responds use a string id of the
   * form `op_<uuid>` so they can never collide with a real numeric id.
   */
  id: number | string
  element_type: string
  order?: number
  content: Record<string, unknown>
  hyperlink: HyperlinkData | null
  created_at: string
  blog_post: number
  isLoading?: boolean
  /** Operation id of the in-flight regenerate/enhance/humanize/add call. */
  loadingOperationId?: string
  /** Snapshot of the original element for overlay-style skeletons; used to
   *  restore the cache entry if the operation fails. Absent on pure inserts. */
  previousElement?: BlogPostElement
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

/** Lightweight list-view shape returned by GET /api/aurora/blog/posts/ */
export interface BlogPostSummary {
  id: number
  title_text: string
  slug: string
  status: number | string
  is_published: boolean
  created_at: string
  cover_image: CoverImage | null
  elements: { id: number; element_type: string }[]
  focus_keyword: string
  excerpt: string
}
