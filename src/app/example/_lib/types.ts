export type ExampleElement = {
  id: string
  order: number
  element_type: string
  content: Record<string, unknown>
}

export type ExamplePost = {
  id: string
  slug: string
  title: string
  excerpt: string
  cover_image_url: string
  published_at: string
  elements: ExampleElement[]
}

export type ExampleFaq = {
  question: string
  answer: string
}

export type ExampleWordDefinition = {
  featured_snippet: string
  paragraph_1: string
  paragraph_2: string
  paragraph_3: string
  synonyms: string[]
  antonyms: string[]
  usage_examples: string[]
  related_keywords: string[]
  faqs: ExampleFaq[]
}

export type ExampleWord = {
  id: string
  keyword: string
  definition: ExampleWordDefinition
}

export type ExampleDictionary = {
  id: string
  name: string
  description: string
  word_count: number
  words: ExampleWord[]
}
