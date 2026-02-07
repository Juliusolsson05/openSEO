import { BlogPostElementType } from '@prisma/client'

const AI_TO_DB: Record<string, BlogPostElementType> = {
  introduction: BlogPostElementType.INTRODUCTION,
  conclusion: BlogPostElementType.CONCLUSION,
  faq: BlogPostElementType.FAQ,
  image: BlogPostElementType.IMAGE,
  paragraph: BlogPostElementType.PARAGRAPH,
  list_paragraph: BlogPostElementType.LIST_PARAGRAPH,
  numbered_list_paragraph: BlogPostElementType.NUMBERED_LIST_PARAGRAPH,
  quote: BlogPostElementType.QUOTE,
  list_featured_snippet_block: BlogPostElementType.LIST_FEATURED_SNIPPET_BLOCK,
  featured_snippet_block: BlogPostElementType.FEATURED_SNIPPET_BLOCK,
  glossary: BlogPostElementType.GLOSSARY,
  product_recommendations: BlogPostElementType.PRODUCT_RECOMMENDATIONS,
}

const DB_TO_AI: Record<BlogPostElementType, string> = Object.fromEntries(
  Object.entries(AI_TO_DB).map(([key, value]) => [value, key]),
) as Record<BlogPostElementType, string>

export function toDbElementType(value: string): BlogPostElementType | null {
  return AI_TO_DB[value] ?? null
}

export function toAiElementType(value: BlogPostElementType): string {
  return DB_TO_AI[value] ?? value.toLowerCase()
}

export function serializeElement(element: {
  id: number
  blogPostId: number
  element_type: BlogPostElementType
  order: number
  content: unknown
  created_at?: Date
}) {
  return {
    id: element.id,
    element_type: toAiElementType(element.element_type),
    content: element.content,
    order: element.order,
    blog_post: element.blogPostId,
    created_at: element.created_at,
  }
}
