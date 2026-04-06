import DOMPurify from 'dompurify'

/**
 * Strictness presets for SafeHtml.
 *
 * - `rich`   — default. Block + inline formatting allowed. Intended for
 *              full prose bodies (Paragraph, RichText, Faq answers).
 * - `inline` — only inline formatting (strong, em, a, br, code, span).
 *              No block tags, no lists, no headings. Intended for
 *              table cells, titles, labels, short fields.
 */
export type SafeHtmlProfile = 'rich' | 'inline'

const INLINE_TAGS = ['b', 'i', 'em', 'strong', 'u', 's', 'br', 'span', 'a', 'code', 'sup', 'sub', 'mark', 'small']
const RICH_TAGS = [
  ...INLINE_TAGS,
  'p', 'div', 'blockquote', 'pre',
  'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'hr',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
]

const COMMON_ATTRS = ['href', 'title', 'target', 'rel', 'class', 'id', 'lang', 'dir']

export function sanitize(html: string, profile: SafeHtmlProfile = 'rich'): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: profile === 'inline' ? INLINE_TAGS : RICH_TAGS,
    ALLOWED_ATTR: COMMON_ATTRS,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'style'],
    ALLOW_DATA_ATTR: false,
    RETURN_TRUSTED_TYPE: false,
  }) as string
}
