'use client'

import type { ElementType, HTMLAttributes } from 'react'
import { sanitize, type SafeHtmlProfile } from './SafeHtml.sanitize'

export { sanitize }
export type { SafeHtmlProfile }

type SafeHtmlProps = {
  html: string | null | undefined
  profile?: SafeHtmlProfile
  as?: ElementType
} & Omit<HTMLAttributes<HTMLElement>, 'dangerouslySetInnerHTML' | 'children'>

/**
 * Renders sanitized HTML. This is the single choke-point through which any
 * inbound/AI-generated HTML string reaches the DOM in the /example renderer.
 *
 * - `profile="rich"` (default): block + inline formatting, safe for prose.
 * - `profile="inline"`: inline formatting only, for titles/labels/cells.
 */
export function SafeHtml({ html, profile = 'rich', as: Tag = 'div', ...rest }: SafeHtmlProps) {
  const clean = sanitize(html ?? '', profile)
  return <Tag {...rest} dangerouslySetInnerHTML={{ __html: clean }} />
}
