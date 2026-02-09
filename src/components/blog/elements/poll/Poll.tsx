'use client'

import { BaseElement } from '../BaseElement'
import type { ElementComponentProps } from '../registry'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'

import type { PollContent } from '@/types/content-elements'

interface PollProps extends Omit<ElementComponentProps, 'content'> {
  content: PollContent
}

export function Poll({ content, blogId, elementId, onContentUpdated, onElementAdded, onElementDeleted }: PollProps) {
  const options = Array.isArray(content?.options) ? content.options : []

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
        {content?.question ? (
          <h2
            className="mb-4 text-2xl font-semibold text-foreground"
            dangerouslySetInnerHTML={{ __html: renderMarkdownInline(content.question) }}
          />
        ) : null}

        <ul className="space-y-2">
          {options.map((option, index) => (
            <li key={index} className="rounded-md bg-muted/50 px-3 py-2 text-foreground">
              {option}
            </li>
          ))}
        </ul>

        {content?.description ? (
          <p
            className="mt-4 text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content.description) }}
          />
        ) : null}
      </div>
    </BaseElement>
  )
}
