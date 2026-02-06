'use client'

import { BaseElement } from '../BaseElement'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'
import type { ElementComponentProps } from '../registry'

type ChecklistItem = {
  action: string
  details?: string
  checked?: boolean
}

type ChecklistContent = {
  title: string
  introduction?: string
  items: ChecklistItem[]
  conclusion?: string
}

interface ChecklistProps extends Omit<ElementComponentProps, 'content'> {
  content: ChecklistContent
}

export function Checklist({ content, blogId, elementId, onContentUpdated, onElementDeleted }: ChecklistProps) {
  const items = Array.isArray(content?.items) ? content.items : []

  const toggleCheck = (index: number) => {
    const updatedItems = items.map((item, itemIndex) =>
      itemIndex === index ? { ...item, checked: !item.checked } : item
    )

    onContentUpdated?.({
      ...content,
      items: updatedItems,
    })
  }

  return (
    <BaseElement
      content={content}
      blogId={blogId}
      elementId={elementId}
      onContentUpdated={onContentUpdated}
      onElementDeleted={onElementDeleted}
    >
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
                className={`flex cursor-pointer items-start gap-3 rounded-md px-3 py-2 transition-colors ${
                  checked ? 'bg-emerald-50' : 'hover:bg-muted/40'
                }`}
                onClick={() => toggleCheck(index)}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCheck(index)}
                  onClick={(event) => event.stopPropagation()}
                  className="mt-1 h-4 w-4 accent-emerald-600"
                />

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
    </BaseElement>
  )
}
