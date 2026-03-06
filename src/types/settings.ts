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

export type IntegrationSetting = {
  key: string
  category: string
  label: string
  hint?: string | null
  maskedValue: string | null
  configured: boolean
  source: 'vault' | 'env' | 'missing'
  updatedAt?: string | null
}

export type SetupStatus = {
  complete: boolean
  hasAdminUser: boolean
  hasCompany: boolean
  hasAiProvider: boolean
  configuredProviderKeys: string[]
}
