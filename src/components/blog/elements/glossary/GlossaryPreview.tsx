'use client'

import { renderMarkdownInline } from '@/lib/markdown'
import { BasePreview } from '../BasePreview'
import type { PreviewComponentProps } from '../registry'

interface GlossaryContent {
  title?: string
  terms?: Record<string, string>
}

export function GlossaryPreview({ content }: PreviewComponentProps) {
  const glossaryContent: GlossaryContent = content ?? {}
  const terms = glossaryContent.terms ?? {}

  return (
    <BasePreview content={glossaryContent}>
      <h2
        className="mb-6 text-3xl font-semibold tracking-tight custom-content"
        dangerouslySetInnerHTML={{ __html: renderMarkdownInline(glossaryContent.title ?? '') }}
      />

      <dl className="flex flex-col">
        {Object.entries(terms).map(([term, definition]) => (
          <div key={term}>
            <dt
              className="mt-4 font-semibold custom-content"
              dangerouslySetInnerHTML={{ __html: renderMarkdownInline(term) }}
            />
            <dd
              className="mb-4 ml-6 custom-content"
              dangerouslySetInnerHTML={{ __html: renderMarkdownInline(definition) }}
            />
          </div>
        ))}
      </dl>
    </BasePreview>
  )
}
