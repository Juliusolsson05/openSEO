'use client'

import { BasePreview } from '../BasePreview'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'
import type { PreviewComponentProps } from '../registry'

type ListParagraphContent = {
  title?: string
  text_before_list?: string
  list_items?: string[]
  text_after_list?: string
}

export function ListParagraphPreview({ content }: PreviewComponentProps) {
  const data = (content || {}) as ListParagraphContent
  const items = Array.isArray(data.list_items) ? data.list_items : []

  return (
    <BasePreview content={content}>
      <h3
        className="mb-3 text-xl font-medium"
        dangerouslySetInnerHTML={{ __html: renderMarkdownInline(data.title) }}
      />

      <div
        className="my-4 text-lg font-light leading-8 text-foreground"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(data.text_before_list) }}
      />

      <ul className="my-4 list-disc space-y-1 pl-5 text-lg font-light leading-8 text-foreground">
        {items.map((item, index) => {
          if (item.includes(':')) {
            const [label, ...rest] = item.split(':')
            return (
              <li key={index}>
                <strong dangerouslySetInnerHTML={{ __html: renderMarkdownInline(label) }} />:
                <span dangerouslySetInnerHTML={{ __html: renderMarkdownInline(rest.join(':')) }} />
              </li>
            )
          }

          return (
            <li key={index}>
              <span dangerouslySetInnerHTML={{ __html: renderMarkdownInline(item) }} />
            </li>
          )
        })}
      </ul>

      <div
        className="my-4 text-lg font-light leading-8 text-foreground"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(data.text_after_list) }}
      />
    </BasePreview>
  )
}
