'use client'

import { useMemo } from 'react'
import { BasePreview } from '../BasePreview'
import type { PreviewComponentProps } from '../registry'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'

export function StatisticPreview({ content }: PreviewComponentProps) {
  const title = content?.title ?? ''
  const percentage = Number(content?.percentage ?? 0)
  const description = content?.description ?? ''

  const titleHtml = useMemo(() => renderMarkdownInline(title), [title])
  const descriptionHtml = useMemo(() => renderMarkdown(description), [description])

  const circumference = useMemo(() => 2 * Math.PI * 45, [])
  const dashOffset = useMemo(() => circumference * (1 - percentage / 100), [circumference, percentage])

  return (
    <BasePreview content={content}>
      <div className="rounded-lg bg-secondary p-[30px]">
        <h3
          className="mb-4 text-center text-2xl font-semibold custom-content"
          dangerouslySetInnerHTML={{ __html: titleHtml }}
        />

        <div className="my-5 flex justify-center">
          <svg className="h-auto w-full max-w-[200px]" width="200" height="200" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#e6e6e6" strokeWidth="8" />
            <circle
              className="transition-[stroke-dashoffset] duration-300"
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#00008B"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
            <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fontSize="20" fontWeight="bold" fill="black">
              {percentage}%
            </text>
          </svg>
        </div>

        <p
          className="mt-4 text-center text-[1.125rem] font-light leading-[1.77778] text-foreground custom-content"
          dangerouslySetInnerHTML={{ __html: descriptionHtml }}
        />
      </div>
    </BasePreview>
  )
}
