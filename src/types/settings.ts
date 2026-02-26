/**
 * Settings domain types — used by settings pages and hooks.
 */

export type GenerationSettings = {
  blog_post_structure_model: string
  blog_post_content_model: string
  initial_generation_elements: Record<string, boolean>
}

export type PublishingSettings = {
  api_endpoint?: string | null
  has_api_key?: boolean
}

export type ApiKey = {
  id: number
  name: string
  key_prefix: string
  is_active: boolean
  key?: string
}
