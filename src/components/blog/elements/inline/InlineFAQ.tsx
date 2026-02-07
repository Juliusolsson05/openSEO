'use client'

import { useState } from 'react'
import { ChevronDown, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { InlineRichText } from './InlineRichText'
import { InlineText } from './InlineText'

interface InlineFAQProps {
  items: Array<{ question: string; answer: string }>
  onChange: (items: Array<{ question: string; answer: string }>) => void
  className?: string
}

export function InlineFAQ({ items, onChange, className }: InlineFAQProps) {
  const [expanded, setExpanded] = useState<number | null>(items.length ? 0 : null)

  const updateItem = (index: number, key: 'question' | 'answer', value: string) => {
    const next = [...items]
    next[index] = { ...next[index], [key]: value }
    onChange(next)
  }

  const addItem = () => {
    const next = [...items, { question: '', answer: '' }]
    onChange(next)
    setExpanded(next.length - 1)
  }

  const removeItem = (index: number) => {
    const next = items.filter((_, i) => i !== index)
    onChange(next)
    if (!next.length) {
      setExpanded(null)
      return
    }
    if (expanded === index) setExpanded(Math.max(0, index - 1))
  }

  return (
    <div className={cn('space-y-3', className)}>
      {items.map((item, index) => {
        const isOpen = expanded === index

        return (
          <div key={index} className="rounded-lg border bg-card">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              onClick={() => setExpanded((current) => (current === index ? null : index))}
            >
              <span className="font-medium">{item.question || `Question ${index + 1}`}</span>
              <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen ? 'rotate-180' : '')} />
            </button>

            {isOpen ? (
              <div className="space-y-3 border-t px-4 py-3">
                <InlineText
                  value={item.question}
                  onChange={(value) => updateItem(index, 'question', value)}
                  placeholder="Question"
                  className="text-base font-medium"
                />
                <InlineRichText
                  value={item.answer}
                  onChange={(value) => updateItem(index, 'answer', value)}
                  placeholder="Answer"
                  className="prose prose-sm max-w-none dark:prose-invert"
                />
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="inline-flex items-center gap-1 text-sm text-destructive"
                >
                  <Trash2 className="h-4 w-4" /> Delete FAQ item
                </button>
              </div>
            ) : null}
          </div>
        )
      })}

      <button type="button" onClick={addItem} className="inline-flex items-center gap-2 text-sm text-primary">
        <Plus className="h-4 w-4" /> Add FAQ item
      </button>
    </div>
  )
}
