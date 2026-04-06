/**
 * Markdown rendering utilities — ported from aurora_dashboard/utils/markdown.ts
 * Uses `marked` for parsing, same config as Vue version, with DOMPurify
 * sanitization applied to the rendered HTML before it leaves this module.
 *
 * Every consumer of this module injects the return value into the DOM via
 * `dangerouslySetInnerHTML`. Because markdown sources can originate from
 * AI generation, user input, or the inbound publishing endpoint, the
 * output MUST be sanitized here — sanitizing at each of the ~48 call
 * sites would be impossible to keep in sync.
 */

import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'

marked.setOptions({
  gfm: true,
  breaks: true,
})

const ALLOWED_TAGS = [
  // headings
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  // block
  'p', 'blockquote', 'pre', 'hr', 'br', 'div',
  // inline
  'a', 'strong', 'em', 'b', 'i', 'u', 's', 'code', 'span', 'sup', 'sub', 'mark', 'small',
  // lists
  'ul', 'ol', 'li',
  // tables
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  // media
  'img',
]

const ALLOWED_ATTR = ['href', 'src', 'alt', 'title', 'target', 'rel', 'class', 'id', 'lang', 'dir', 'colspan', 'rowspan']

// http(s):, mailto:, tel:, and relative URLs. Strips javascript:, data:, vbscript:, file:.
const ALLOWED_URI_REGEXP = /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i

const sanitizeHtml = (raw: string): string =>
  DOMPurify.sanitize(raw, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'textarea', 'select', 'link', 'meta'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur', 'onchange', 'onsubmit', 'style', 'srcset'],
    ALLOW_DATA_ATTR: false,
    RETURN_TRUSTED_TYPE: false,
  }) as string

const toStringValue = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  return String(value)
}

/** Render a block of markdown → sanitized HTML (wraps in <p> etc.) */
export const renderMarkdown = (value: unknown): string => {
  const source = toStringValue(value)
  if (!source) return ''
  const rawHtml = marked.parse(source, { async: false }) as string
  return sanitizeHtml(rawHtml)
}

/** Render inline markdown → sanitized inline HTML (no wrapping <p>) */
export const renderMarkdownInline = (value: unknown): string => {
  const source = toStringValue(value)
  if (!source) return ''
  const rawHtml = marked.parseInline(source, { async: false }) as string
  return sanitizeHtml(rawHtml)
}
