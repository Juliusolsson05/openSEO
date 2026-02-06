'use client'

import { BaseElement } from '../BaseElement'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'
import type { ElementComponentProps } from '../registry'

interface TableContent {
  title: string
  text_before?: string
  headers: string[]
  rows: string[][]
  text_after?: string
}

interface TableProps extends Omit<ElementComponentProps, 'content'> {
  content: TableContent
}

export function Table({ content, blogId, elementId, onContentUpdated, onElementDeleted }: TableProps) {
  return (
    <BaseElement
      content={content}
      blogId={blogId}
      elementId={elementId}
      onContentUpdated={onContentUpdated}
      onElementDeleted={onElementDeleted}
    >
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
              {content.headers.map((header, index) => (
                <th
                  key={index}
                  className="border-b px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground"
                  dangerouslySetInnerHTML={{ __html: renderMarkdownInline(header) }}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {content.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="odd:bg-background even:bg-muted/20 hover:bg-muted/40 transition-colors">
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
    </BaseElement>
  )
}
