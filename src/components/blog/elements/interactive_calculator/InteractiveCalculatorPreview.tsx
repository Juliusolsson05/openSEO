'use client'

import { BasePreview } from '../BasePreview'
import type { PreviewComponentProps } from '../registry'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'

import type { InteractiveCalculatorContent } from '@/types/content-elements'

interface InteractiveCalculatorPreviewProps extends Omit<PreviewComponentProps, 'content'> {
  content: InteractiveCalculatorContent
}

export function InteractiveCalculatorPreview({ content }: InteractiveCalculatorPreviewProps) {
  return (
    <BasePreview content={content}>
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
    </BasePreview>
  )
}
