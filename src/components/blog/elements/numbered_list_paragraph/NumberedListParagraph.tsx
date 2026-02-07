'use client'

import { BaseElement } from '../BaseElement'
import type { ElementComponentProps } from '../registry'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'

type NumberedListParagraphContent = {
  title?: string
  text_before_list?: string
  list_items?: string[]
  text_after_list?: string
}

function renderListItem(item: string, index: number) {
  if (item.includes(':')) {
    const [head, ...tail] = item.split(':')
    return (
      <li key={index}>
        <strong dangerouslySetInnerHTML={{ __html: renderMarkdownInline(head) }} />:
        <span dangerouslySetInnerHTML={{ __html: renderMarkdownInline(tail.join(':')) }} />
      </li>
    )
  }

  return (
    <li key={index}>
      <span dangerouslySetInnerHTML={{ __html: renderMarkdownInline(item) }} />
    </li>
  )
}

export function NumberedListParagraph({ content, blogId, elementId, onContentUpdated, onElementDeleted }: ElementComponentProps) {
  const data = (content ?? {}) as NumberedListParagraphContent

  return (
    <BaseElement
      content={content}
      blogId={blogId}
      elementId={elementId}
      onContentUpdated={onContentUpdated}
      onElementDeleted={onElementDeleted}
    >
      <div>
        <h3
          className="mb-[10px] text-[1.5rem] font-medium leading-tight text-foreground"
          dangerouslySetInnerHTML={{ __html: renderMarkdownInline(data.title ?? '') }}
        />

        <div
          className="my-[15px] text-lg font-light leading-[1.77778] text-foreground"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(data.text_before_list ?? '') }}
        />

        <ol className="my-[15px] pl-5 text-lg font-light leading-[1.77778] text-foreground underline">
          {(data.list_items ?? []).map((item, index) => renderListItem(item, index))}
        </ol>

        <div
          className="my-[15px] text-lg font-light leading-[1.77778] text-foreground"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(data.text_after_list ?? '') }}
        />
      </div>
    </BaseElement>
  )
}
