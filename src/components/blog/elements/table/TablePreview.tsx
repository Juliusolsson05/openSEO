'use client'

import { BasePreview } from '../BasePreview'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'
import type { PreviewComponentProps } from '../registry'

import type { TableContent } from '@/types/content-elements'

interface TablePreviewProps extends Omit<PreviewComponentProps, 'content'> {
  content: TableContent
}

export function TablePreview({ content }: TablePreviewProps) {
  return (
    <BasePreview content={content}>
      <h3
        className="mb-6 text-2xl font-semibold text-foreground"
        dangerouslySetInnerHTML={{ __html: renderMarkdownInline(content.title) }}
      />

      {content.text_before ? (
        <p
          className="my-6 text-[1.05rem] leading-relaxed text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content.text_before) }}
        />
      ) : null}

      <div className="my-8 overflow-x-auto rounded-lg border shadow-sm">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-muted/50">
              {(content.headers ?? []).map((header, index) => (
                <th
                  key={index}
                  className="border-b px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground"
                  dangerouslySetInnerHTML={{ __html: renderMarkdownInline(header) }}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {(content.rows ?? []).map((row, rowIndex) => (
              <tr key={rowIndex} className="odd:bg-background even:bg-muted/20">
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="border-b px-4 py-3 text-sm text-foreground"
                    dangerouslySetInnerHTML={{ __html: renderMarkdownInline(cell) }}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {content.text_after ? (
        <p
          className="my-6 text-[1.05rem] leading-relaxed text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content.text_after) }}
        />
      ) : null}
    </BasePreview>
  )
}
