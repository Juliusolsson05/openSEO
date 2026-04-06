'use client'

import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'

import { SafeHtml } from '@/components/SafeHtml'
import { RichText } from './RichText'

type FaqItem = { question: string; answer: string }

type FaqProps = {
  title?: string
  items: FaqItem[]
}

export function Faq({ title = 'Frequently asked questions', items }: FaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(items.length ? 0 : null)

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">{title}</h2>
      <div className="space-y-3">
        {items.map((item, index) => {
          const expanded = openIndex === index

          return (
            <div key={`${item.question}-${index}`} className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
              <button
                type="button"
                onClick={() => setOpenIndex((current) => (current === index ? null : index))}
                className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
              >
                <SafeHtml as="span" profile="inline" className="font-medium text-neutral-900" html={item.question} />
                {expanded ? <Minus className="h-4 w-4 shrink-0 text-neutral-600" /> : <Plus className="h-4 w-4 shrink-0 text-neutral-600" />}
              </button>

              {expanded ? <RichText html={item.answer} className="px-6 pb-5 text-sm leading-relaxed text-neutral-600" /> : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}
