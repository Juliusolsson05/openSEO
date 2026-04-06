'use client'

import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { BasePreview } from '../BasePreview'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'
import { Button } from '@/components/ui/button'
import type { PreviewComponentProps } from '../registry'
import { normalizeFaqContent } from './shared'

export function FAQPreview({ content }: PreviewComponentProps) {
  const { title, items } = normalizeFaqContent(content)
  const [openIndex, setOpenIndex] = useState<number | null>(items.length ? 0 : null)

  const toggleItem = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index))
  }

  return (
    <BasePreview content={content}>
      <div className="mb-6 flex items-center justify-between">
        <h2
          className="mt-12 text-3xl font-semibold tracking-tight"
          dangerouslySetInnerHTML={{ __html: renderMarkdownInline(title || 'FAQ') }}
        />
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
    </BasePreview>
  )
}
