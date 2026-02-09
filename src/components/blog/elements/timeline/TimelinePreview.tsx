import { BasePreview } from '../BasePreview'
import type { PreviewComponentProps } from '../registry'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'

import type { TimelineContent } from '@/types/content-elements'

interface TimelinePreviewProps extends Omit<PreviewComponentProps, 'content'> {
  content: TimelineContent
}

export function TimelinePreview({ content }: TimelinePreviewProps) {
  const events = Array.isArray(content?.events) ? content.events : []

  return (
    <BasePreview content={content}>
      {content?.title && (
        <h3
          className="mb-4 text-[22px] font-semibold leading-tight tracking-tight text-foreground"
          dangerouslySetInnerHTML={{ __html: renderMarkdownInline(content.title) }}
        />
      )}

      {content?.text_before && (
        <p
          className="mt-3 mb-6 text-[17px] font-light leading-[1.8] text-foreground [&_strong]:font-semibold [&_em]:font-[450]"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content.text_before) }}
        />
      )}

      <div className="relative ml-4 border-l-2 border-primary/30 pl-8 space-y-8">
        {events.map((event, index) => (
          <div key={index} className="relative">
            <div className="absolute -left-[41px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-primary bg-card">
              <div className="h-2 w-2 rounded-full bg-primary" />
            </div>
            <div
              className="mb-1.5 inline-block rounded-full bg-primary/10 px-3 py-0.5 text-[12px] font-semibold text-primary"
              dangerouslySetInnerHTML={{ __html: renderMarkdownInline(event.date ?? '') }}
            />
            <h4
              className="text-[17px] font-semibold leading-snug text-foreground"
              dangerouslySetInnerHTML={{ __html: renderMarkdownInline(event.title ?? '') }}
            />
            <div
              className="mt-1.5 text-[16px] font-light leading-[1.7] text-muted-foreground [&_strong]:font-semibold [&_em]:font-[450]"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(event.description ?? '') }}
            />
          </div>
        ))}
      </div>

      {content?.text_after && (
        <p
          className="mt-6 text-[17px] font-light leading-[1.8] text-foreground [&_strong]:font-semibold [&_em]:font-[450]"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content.text_after) }}
        />
      )}
    </BasePreview>
  )
}
