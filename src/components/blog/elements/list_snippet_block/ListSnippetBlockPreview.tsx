'use client'

import { BasePreview } from '../BasePreview'
import { renderMarkdownInline } from '@/lib/markdown'
import type { PreviewComponentProps } from '../registry'

type ListSnippetBlockContent = {
  title?: string
  list?: string[]
}

export function ListSnippetBlockPreview({ content }: PreviewComponentProps) {
  const data = (content || {}) as ListSnippetBlockContent
  const items = Array.isArray(data.list) ? data.list : []

  return (
    <BasePreview content={content}>
      <div className="my-[30px] border-[10px] border-primary/90 bg-[rgba(211,211,211,0.44)] p-[45px]">
        <h2
          className="mb-5 text-[28px] font-medium leading-[40px]"
          dangerouslySetInnerHTML={{ __html: renderMarkdownInline(data.title) }}
        />

        <ul className="list-disc pl-5 text-[18px] leading-8">
          {items.map((item, index) => (
            <li key={index} dangerouslySetInnerHTML={{ __html: renderMarkdownInline(item) }} />
          ))}
        </ul>
      </div>
    </BasePreview>
  )
}
