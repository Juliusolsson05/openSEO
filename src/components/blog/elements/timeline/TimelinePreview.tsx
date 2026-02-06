import { BasePreview } from '../BasePreview'
import type { PreviewComponentProps } from '../registry'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'

interface TimelineEvent {
  date: string
  title: string
  description: string
}

interface TimelineContent {
  title?: string
  text_before?: string
  events: TimelineEvent[]
  text_after?: string
}

interface TimelinePreviewProps extends Omit<PreviewComponentProps, 'content'> {
  content: TimelineContent
}

export function TimelinePreview({ content }: TimelinePreviewProps) {
  return (
    <BasePreview content={content}>
      <div className="timeline-wrapper">
        {content.title ? (
          <h3
            className="mb-4 text-2xl font-semibold leading-tight text-foreground"
            dangerouslySetInnerHTML={{ __html: renderMarkdownInline(content.title) }}
          />
        ) : null}

        {content.text_before ? (
          <p
            className="my-6 text-[1.05rem] leading-relaxed text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content.text_before) }}
          />
        ) : null}

        <div className="relative my-8 py-8 before:absolute before:bottom-0 before:left-1/2 before:top-0 before:w-0.5 before:-translate-x-1/2 before:bg-border max-md:before:left-0 max-md:before:translate-x-0">
          {(content.events || []).map((event, index) => {
            const isLeft = index % 2 === 0

            return (
              <div key={index} className="relative mb-12 flex w-full justify-center max-md:ml-6 max-md:block">
                <div
                  className={[
                    'w-[45%] rounded-lg border-l-4 border-l-primary bg-background p-6 shadow-sm',
                    isLeft
                      ? 'mr-[50%] pr-8 text-right max-md:mr-0 max-md:ml-4 max-md:w-[calc(100%-2rem)] max-md:p-4 max-md:text-left'
                      : 'ml-[50%] pl-8 text-left max-md:ml-4 max-md:w-[calc(100%-2rem)] max-md:p-4',
                  ].join(' ')}
                >
                  <div
                    className="mb-2 text-sm font-medium text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: renderMarkdownInline(event?.date ?? '') }}
                  />
                  <h4
                    className="mb-2 text-xl font-semibold text-primary"
                    dangerouslySetInnerHTML={{ __html: renderMarkdownInline(event?.title ?? '') }}
                  />
                  <div
                    className="text-base leading-relaxed text-foreground"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(event?.description ?? '') }}
                  />
                </div>

                <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-primary shadow-[0_0_0_3px_hsl(var(--primary))] max-md:left-0 max-md:translate-x-0" />
              </div>
            )
          })}
        </div>

        {content.text_after ? (
          <p
            className="my-6 text-[1.05rem] leading-relaxed text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content.text_after) }}
          />
        ) : null}
      </div>
    </BasePreview>
  )
}
