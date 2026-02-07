'use client'

import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { BaseElement } from '../BaseElement'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'
import { Button } from '@/components/ui/button'
import type { ElementComponentProps } from '../registry'

interface FAQItem {
  question: string
  answer: string
}

export function FAQ({
  content,
  blogId,
  elementId,
  onContentUpdated,
  onElementAdded,
  onElementDeleted,
}: ElementComponentProps) {
  const items: FAQItem[] = Array.isArray(content) ? content : []
  const [openIndex, setOpenIndex] = useState<number | null>(items.length ? 0 : null)

  const toggleItem = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index))
  }

  return (
    <BaseElement
      content={items}
      blogId={blogId}
      elementId={elementId}
      allowDelete={false}
      allowAddElement={false}
      onContentUpdated={onContentUpdated}
      onElementAdded={onElementAdded}
      onElementDeleted={onElementDeleted}
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="mt-12 text-3xl font-semibold tracking-tight">FAQ</h2>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => {
          const expanded = openIndex === index

          return (
            <div key={index} className="overflow-hidden rounded-lg border bg-card">
              <Button
                type="button"
                variant="ghost"
                onClick={() => toggleItem(index)}
                className="flex h-auto w-full items-center justify-between gap-4 px-6 py-4 text-left"
              >
                <span
                  className="font-medium"
                  dangerouslySetInnerHTML={{ __html: renderMarkdownInline(item.question) }}
                />
                {expanded ? <Minus className="h-4 w-4 shrink-0" /> : <Plus className="h-4 w-4 shrink-0" />}
              </Button>

              {expanded && (
                <div className="px-6 pb-5 prose prose-sm max-w-none dark:prose-invert">
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdown(item.answer) }} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </BaseElement>
  )
}
