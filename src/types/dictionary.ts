/**
 * Dictionary and public content types — unified from PublicX and ExampleX variants.
 */

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
