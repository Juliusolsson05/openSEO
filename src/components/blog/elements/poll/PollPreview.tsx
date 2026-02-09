'use client'

import { BasePreview } from '../BasePreview'
import type { PreviewComponentProps } from '../registry'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'

import type { PollContent } from '@/types/content-elements'

interface PollPreviewProps extends Omit<PreviewComponentProps, 'content'> {
  content: PollContent
}

export function PollPreview({ content }: PollPreviewProps) {
  const options = Array.isArray(content?.options) ? content.options : []

  return (
    <BasePreview content={content}>
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
    </BasePreview>
  )
}
