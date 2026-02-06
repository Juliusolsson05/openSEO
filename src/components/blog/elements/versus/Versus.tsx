'use client'

import { BaseElement } from '../BaseElement'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'
import type { ElementComponentProps } from '../registry'

interface VersusCriterion {
  name: string
  winner: number
  details: string[]
}

interface VersusContent {
  title?: string
  text_before?: string
  competitors: string[]
  criteria: VersusCriterion[]
  text_after?: string
}

interface VersusProps extends Omit<ElementComponentProps, 'content'> {
  content: VersusContent
}

export function Versus({ content, blogId, elementId, onContentUpdated, onElementAdded, onElementDeleted }: VersusProps) {
  return (
    <BaseElement
      content={content}
      blogId={blogId}
      elementId={elementId}
      onContentUpdated={onContentUpdated}
      onElementAdded={onElementAdded}
      onElementDeleted={onElementDeleted}
    >
      {content.title ? (
        <h3
          className="mb-6 text-2xl font-semibold text-foreground"
          dangerouslySetInnerHTML={{ __html: renderMarkdownInline(content.title) }}
        />
      ) : null}

      {content.text_before ? (
        <p
          className="my-6 text-[1.05rem] leading-relaxed text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content.text_before) }}
        />
      ) : null}

      <div className="my-8 overflow-hidden rounded-lg border">
        <div className="grid grid-cols-2 bg-muted/40 font-semibold md:grid-cols-[30%_1fr_1fr]">
          <div className="hidden border-b p-4 md:block" />
          {content.competitors.map((competitor, index) => (
            <div
              key={`competitor-${index}`}
              className="border-b p-4 text-center"
              dangerouslySetInnerHTML={{ __html: renderMarkdownInline(competitor) }}
            />
          ))}
        </div>

        {content.criteria.map((criterion, index) => (
          <div key={`criterion-${index}`} className="grid grid-cols-1 border-b last:border-b-0 md:grid-cols-[30%_1fr_1fr]">
            <div
              className="bg-muted/25 p-4 font-semibold"
              dangerouslySetInnerHTML={{ __html: renderMarkdownInline(criterion.name) }}
            />

            {criterion.details.map((detail, detailIndex) => {
              const isWinner = criterion.winner === detailIndex

              return (
                <div key={`detail-${index}-${detailIndex}`} className={`relative p-4 ${isWinner ? 'bg-emerald-50 dark:bg-emerald-950/30' : ''}`}>
                  <span dangerouslySetInnerHTML={{ __html: renderMarkdownInline(detail) }} />
                  {isWinner ? <span className="absolute top-1/2 right-4 -translate-y-1/2 font-bold text-emerald-600">✓</span> : null}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {content.text_after ? (
        <p
          className="my-6 text-[1.05rem] leading-relaxed text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content.text_after) }}
        />
      ) : null}
    </BaseElement>
  )
}
