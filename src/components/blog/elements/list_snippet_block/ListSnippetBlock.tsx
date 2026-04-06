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
    const kws = (hyperlink?.matched_keywords as any)?.list?.[index]
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
      <div className="rounded-lg border border-border bg-secondary/50 p-5">
        <h2
          className="mb-4 text-[22px] font-semibold leading-tight tracking-tight text-foreground"
          dangerouslySetInnerHTML={{ __html: renderMarkdownInline(applyHyperlinks(data.title ?? '', hyperlink, 'title')) }}
        />

        <ul className="my-4 list-disc pl-6 space-y-2">
          {items.map((item, index) => (
            <li key={index} className="text-[16px] font-light leading-[1.7] text-foreground [&_strong]:font-semibold [&_em]:font-[450]" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(hyperlinkedListItem(item, index)) }} />
          ))}
        </ul>
      </div>
    </BaseElement>
  )
}
