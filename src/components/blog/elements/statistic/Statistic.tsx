'use client'

import { useMemo } from 'react'
import { BaseElement } from '../BaseElement'
import type { ElementComponentProps } from '../registry'
import { renderMarkdownInline } from '@/lib/markdown'

type HyperlinkMatch = {
  keyword: string
  description: string
  matched_positions: number[]
}

interface StatisticProps extends ElementComponentProps {
  hyperlink?: {
    matched_keywords?: {
      title?: HyperlinkMatch[]
      description?: HyperlinkMatch[]
    }
  } | null
}

const createHyperlinkedText = (text: string, _keywords: HyperlinkMatch[]): string => {
  return text
}

export function Statistic({ content, blogId, elementId, onContentUpdated, onElementDeleted, onElementAdded, hyperlink }: StatisticProps) {
  const title = content?.title ?? ''
  const percentage = Number(content?.percentage ?? 0)
  const description = content?.description ?? ''

  const formattedTitle = useMemo(() => {
    if (hyperlink?.matched_keywords?.title?.length) {
      return renderMarkdownInline(createHyperlinkedText(title, hyperlink.matched_keywords.title))
    }
    return renderMarkdownInline(title)
  }, [title, hyperlink?.matched_keywords?.title])

  const formattedDescription = useMemo(() => {
    let text = description
    text = text.replace(/(<br\s*\/?>)(?!<br\s*\/?>)/g, '<br/><br/>')
    text = text.replace(/(<br\s*\/?>){3,}/g, '<br/><br/>')

    if (hyperlink?.matched_keywords?.description?.length) {
      text = createHyperlinkedText(text, hyperlink.matched_keywords.description)
    }

    return text
  }, [description, hyperlink?.matched_keywords?.description])

  const circumference = useMemo(() => 2 * Math.PI * 45, [])
  const dashOffset = useMemo(() => circumference * (1 - percentage / 100), [circumference, percentage])

  return (
    <BaseElement
      content={content}
      blogId={blogId}
      elementId={elementId}
      onContentUpdated={onContentUpdated}
      onElementDeleted={onElementDeleted}
      onElementAdded={onElementAdded}
    >
      <div className="rounded-lg bg-secondary p-[30px]">
        <h3
          className="mb-4 text-center text-2xl font-semibold custom-content"
          dangerouslySetInnerHTML={{ __html: formattedTitle }}
        />

        <div className="my-5 flex justify-center">
          <svg className="h-auto w-full max-w-[200px]" width="200" height="200" viewBox="0 0 100 100">
            <circle className="circle-background" cx="50" cy="50" r="45" fill="none" stroke="#e6e6e6" strokeWidth="8" />
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
          dangerouslySetInnerHTML={{ __html: formattedDescription }}
        />
      </div>
    </BaseElement>
  )
}
