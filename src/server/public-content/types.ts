export type PublicElement = {
  id: string
  order: number
  element_type: string
  content: Record<string, unknown>
}

export type PublicPost = {
  id: string
  slug: string
  title: string
  excerpt: string
  cover_image_url: string
  published_at: string
  elements: PublicElement[]
}

export type PublicFaq = {
  question: string
  answer: string
}

export type PublicWordDefinition = {
  featured_snippet: string
  paragraph_1: string
  paragraph_2: string
  paragraph_3: string
  synonyms: string[]
  antonyms: string[]
  usage_examples: string[]
  related_keywords: string[]
  faqs: PublicFaq[]
}

export type PublicWord = {
  id: string
  keyword: string
  definition: PublicWordDefinition
}

export type PublicDictionary = {
  id: string
  name: string
  description: string
  word_count: number
  words: PublicWord[]
}
