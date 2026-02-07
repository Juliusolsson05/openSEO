'use client'

import { BaseElement } from '../BaseElement'
import { renderMarkdownInline } from '@/lib/markdown'
import type { ElementComponentProps } from '../registry'
import { applyHyperlinks, createHyperlinkedText } from '../hyperlink-utils'

type ListSnippetBlockContent = {
  title?: string
  list?: string[]
}

export function ListSnippetBlock({
  content,
  blogId,
  elementId,
  onContentUpdated,
  onElementAdded,
  onElementDeleted,
  hyperlink,
}: ElementComponentProps) {
  const data = (content || {}) as ListSnippetBlockContent
  const items = Array.isArray(data.list) ? data.list : []

  const hyperlinkedListItem = (item: string, index: number) => {
    const kws = (hyperlink?.matched_keywords as any)?.list_items?.[index]
    return Array.isArray(kws) && kws.length ? createHyperlinkedText(item, kws) : item
  }

  return (
    <BaseElement
      content={content}
      blogId={blogId}
      elementId={elementId}
      onContentUpdated={onContentUpdated}
      onElementAdded={onElementAdded}
      onElementDeleted={onElementDeleted}
    >
      <div className="my-[30px] border-[10px] border-primary/90 bg-[rgba(211,211,211,0.44)] p-[45px]">
        <h2
          className="mb-5 text-[28px] font-medium leading-[40px]"
          dangerouslySetInnerHTML={{ __html: renderMarkdownInline(applyHyperlinks(data.title ?? '', hyperlink, 'title')) }}
        />

        <ul className="list-disc pl-5 text-[18px] leading-8">
          {items.map((item, index) => (
            <li key={index} dangerouslySetInnerHTML={{ __html: renderMarkdownInline(hyperlinkedListItem(item, index)) }} />
          ))}
        </ul>
      </div>
    </BaseElement>
  )
}
