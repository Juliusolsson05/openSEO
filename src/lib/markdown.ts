/**
 * Markdown rendering utilities — ported from aurora_dashboard/utils/markdown.ts
 * Uses `marked` for parsing, same config as Vue version.
 */

import { marked } from 'marked'

marked.setOptions({
  gfm: true,
  breaks: true,
})

const toStringValue = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  return String(value)
}

/** Render a block of markdown → full HTML (wraps in <p> etc.) */
export const renderMarkdown = (value: unknown): string => {
  const source = toStringValue(value)
  if (!source) return ''
  return marked.parse(source, { async: false }) as string
}

/** Render inline markdown → inline HTML (no wrapping <p>) */
export const renderMarkdownInline = (value: unknown): string => {
  const source = toStringValue(value)
  if (!source) return ''
  return marked.parseInline(source, { async: false }) as string
}
