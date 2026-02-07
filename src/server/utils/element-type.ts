/**
 * Element type utilities — maps between AI-generated lowercase names
 * and DB storage format (UPPERCASE).
 * 
 * Now that element_type is a plain String in the DB, any type is accepted.
 */

export function toDbElementType(value: string): string {
  return value.toUpperCase()
}

export function toAiElementType(value: string): string {
  return value.toLowerCase()
}

export function serializeElement(element: {
  id: number
  element_type: string
  order: number
  content: unknown
  created_at: Date | string
  hyperlink?: { matched_keywords: unknown } | null
}) {
  return {
    id: element.id,
    element_type: toAiElementType(element.element_type),
    order: element.order,
    content: element.content,
    created_at: element.created_at,
    hyperlink: element.hyperlink ?? null,
  }
}
