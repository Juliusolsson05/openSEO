'use client'

import { BasePreview } from '../BasePreview'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'
import type { PreviewComponentProps } from '../registry'
import type { ChecklistContent } from '@/types/content-elements'

interface ChecklistPreviewProps extends Omit<PreviewComponentProps, 'content'> {
  content: ChecklistContent
}

export function ChecklistPreview({ content }: ChecklistPreviewProps) {
  const items = Array.isArray(content?.items) ? content.items : []

  return (
    <BasePreview content={content}>
      <div className="mx-auto max-w-[800px] rounded-lg border bg-card p-6 shadow-sm">
        <h2
          className="mb-4 text-3xl font-bold text-primary"
          dangerouslySetInnerHTML={{ __html: renderMarkdownInline(content?.title || '') }}
        />

        {content?.introduction ? (
          <p
            className="mb-6 text-base text-foreground"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content.introduction) }}
          />
        ) : null}

        <ul className="space-y-1">
          {items.map((item, index) => {
            const checked = !!item.checked

            return (
              <li
                key={index}
                className={`flex items-start gap-3 rounded-md px-3 py-2 transition-colors ${checked ? 'bg-emerald-50' : ''}`}
              >
                <span
                  className={`mt-1 inline-flex h-4 w-4 items-center justify-center rounded-sm border text-[10px] leading-none ${
                    checked ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-muted-foreground/40'
                  }`}
                >
                  {checked ? '✓' : ''}
                </span>

                <div>
                  <div
                    className={`font-medium ${checked ? 'text-emerald-700' : 'text-foreground'}`}
                    dangerouslySetInnerHTML={{ __html: renderMarkdownInline(item.action) }}
                  />

                  {item.details ? (
                    <p
                      className="mt-1 text-sm text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: renderMarkdownInline(item.details) }}
                    />
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>

        {content?.conclusion ? (
          <p
            className="mt-4 text-sm text-emerald-700"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content.conclusion) }}
          />
        ) : null}
      </div>
    </BasePreview>
  )
}
