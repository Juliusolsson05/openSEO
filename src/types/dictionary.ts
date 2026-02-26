/**
 * Dictionary domain types — public content and dashboard variants.
 */

// ─── Dashboard dictionary types ──────────────────────────────────────────────
// Used by dashboard pages and the dictionary session store.

export interface DashboardFAQ {
  question: string
  answer: string
}

export interface DashboardDefinition {
  title: string
  featured_google_snippet: string
  meta_description?: string
  paragraph_1?: { title: string; text: string }
  paragraph_2?: { title: string; text: string }
  paragraph_3?: { title: string; text: string }
  synonyms: string[]
  antonyms: string[]
  usage_examples: string[]
  related_keywords: string[]
  faqs: DashboardFAQ[]
}

export interface DashboardWord {
  id?: number
  keyword: string
  definition: DashboardDefinition
}

export interface DashboardDictionary {
  id: number
  title: string
  subject: string
  language: string
  num_words: number
  total_words?: number
  current_letter?: string
  status?: string
  words?: Array<{
    id: number
    keyword: string
    letter: string
    description: string
    priority: number | string
    has_definition?: boolean
  }>
}

// ─── Public content types ─────────────────────────────────────────────────────

export interface ContentElement {
  id: string
  order: number
  element_type: string
  content: Record<string, any>
}

export interface ContentPost {
  id: string
  slug: string
  title: string
  excerpt: string
  cover_image_url: string
  cover_image_alt?: string
  published_at: string
  elements: ContentElement[]
}

export interface ContentFaq {
  question: string
  answer: string
}

export interface WordDefinition {
  featured_snippet: string
  paragraph_1: string
  paragraph_2: string
  paragraph_3: string
  synonyms: string[]
  antonyms: string[]
  usage_examples: string[]
  related_keywords: string[]
  faqs: ContentFaq[]
}

export interface ContentWord {
  id: string
  keyword: string
  definition: WordDefinition
}

export interface ContentDictionary {
  id: string
  name: string
  description: string
  word_count: number
  words: ContentWord[]
}
