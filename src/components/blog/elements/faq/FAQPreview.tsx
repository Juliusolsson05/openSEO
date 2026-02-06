'use client'

import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { BasePreview } from '../BasePreview'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'
import type { PreviewComponentProps } from '../registry'

interface FAQItem {
  question: string
  answer: string
}

export function FAQPreview({ content }: PreviewComponentProps) {
  const items: FAQItem[] = Array.isArray(content) ? content : []
  const [openIndex, setOpenIndex] = useState<number | null>(items.length ? 0 : null)

  const toggleItem = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index))
  }

  return (
    <BasePreview content={items}>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="mt-12 text-3xl font-semibold tracking-tight">FAQ</h2>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => {
          const expanded = openIndex === index

          return (
            <div key={index} className="overflow-hidden rounded-lg border bg-card">
              <button
                type="button"
                onClick={() => toggleItem(index)}
                className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
              >
                <span
                  className="font-medium"
                  dangerouslySetInnerHTML={{ __html: renderMarkdownInline(item.question) }}
                />
                {expanded ? <Minus className="h-4 w-4 shrink-0" /> : <Plus className="h-4 w-4 shrink-0" />}
              </button>

              {expanded && (
                <div className="px-6 pb-5 prose prose-sm max-w-none dark:prose-invert">
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdown(item.answer) }} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </BasePreview>
  )
}
