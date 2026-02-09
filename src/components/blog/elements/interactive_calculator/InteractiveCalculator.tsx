'use client'

import { BaseElement } from '../BaseElement'
import type { ElementComponentProps } from '../registry'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'

import type { InteractiveCalculatorContent } from '@/types/content-elements'

interface InteractiveCalculatorProps extends Omit<ElementComponentProps, 'content'> {
  content: InteractiveCalculatorContent
}

export function InteractiveCalculator({
  content,
  blogId,
  elementId,
  onContentUpdated,
  onElementAdded,
  onElementDeleted,
}: InteractiveCalculatorProps) {
  return (
    <BaseElement
      content={content}
      blogId={blogId}
      elementId={elementId}
      onContentUpdated={onContentUpdated}
      onElementAdded={onElementAdded}
      onElementDeleted={onElementDeleted}
    >
      <div className="rounded-lg border border-border p-5">
        {content?.title ? (
          <h2
            className="mb-3 text-2xl font-semibold text-foreground"
            dangerouslySetInnerHTML={{ __html: renderMarkdownInline(content.title) }}
          />
        ) : null}

        {content?.description ? (
          <p
            className="text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content.description) }}
          />
        ) : null}

        {content?.result ? (
          <div className="mt-4 rounded-md bg-muted px-4 py-3 text-2xl font-bold text-foreground">
            <span dangerouslySetInnerHTML={{ __html: renderMarkdownInline(content.result) }} />
          </div>
        ) : null}
      </div>
    </BaseElement>
  )
}
