/**
 * Generation constants — single source of truth for default elements and model options.
 * Shared between the server (blog.service.ts) and the settings UI.
 */

/** Default element types enabled on initial blog post generation. */
export const DEFAULT_GENERATION_ELEMENTS: Record<string, boolean> = {
  introduction: true,
  paragraph: true,
  image: true,
  faq: true,
  conclusion: true,
  list_paragraph: true,
  numbered_list_paragraph: true,
  featured_snippet_block: true,
  table: true,
  pros_and_cons: true,
  quote: true,
}

/**
 * All available element types selectable in the generation settings UI.
 * Order determines display order.
 */
export const GENERATION_ELEMENT_OPTIONS: string[] = [
  'paragraph',
  'list_paragraph',
  'numbered_list_paragraph',
  'image',
  'introduction',
  'conclusion',
  'table',
  'quote',
  'featured_snippet_block',
  'list_featured_snippet_block',
  'pros_and_cons',
  'faq',
  'timeline',
  'versus',
  'statistic',
  'bar_chart',
  'case_study',
  'tool_recommendation',
  'glossary',
  'context',
  'code_cluster',
  'poll',
  'quiz',
  'interactive_calculator',
]

/**
 * Available model identifiers for the generation settings UI.
 * Mirrors MODELS in src/server/ai/clients.ts — keep in sync if models change.
 */
export const MODEL_OPTIONS: string[] = [
  'gpt-5-mini',
  'gpt-5.2',
  'claude-sonnet-4-5-20250929',
  'gemini-2.5-pro',
]
