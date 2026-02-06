'use client'

import { renderMarkdownInline } from '@/lib/markdown'
import { BaseElement } from '../BaseElement'
import type { ElementComponentProps } from '../registry'

interface GlossaryContent {
  title?: string
  terms?: Record<string, string>
}

export function Glossary({
  content,
  blogId,
  elementId,
  onContentUpdated,
  onElementAdded,
  onElementDeleted,
}: ElementComponentProps) {
  const glossaryContent: GlossaryContent = content ?? {}
  const terms = glossaryContent.terms ?? {}

  return (
    <BaseElement
      content={glossaryContent}
      blogId={blogId}
      elementId={elementId}
      onContentUpdated={onContentUpdated}
      onElementAdded={onElementAdded}
      onElementDeleted={onElementDeleted}
    >
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
    </BaseElement>
  )
}
