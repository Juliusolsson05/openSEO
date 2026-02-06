'use client'

import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'
import type { ElementComponentProps } from '../registry'

type ListParagraphContent = {
  title?: string
  text_before_list?: string
  list_items?: string[]
  text_after_list?: string
}

const isColonSeparated = (item: string): boolean => item.includes(':')

const getItemLabel = (item: string): string => `${item.split(':')[0]}:`

const getItemContent = (item: string): string => item.split(':').slice(1).join(':')

export function ListParagraph({ content }: ElementComponentProps) {
  const data = (content || {}) as ListParagraphContent
  const items = Array.isArray(data.list_items) ? data.list_items : []

  return (
    <>
      <h3
        className="mb-3 text-xl font-medium"
        dangerouslySetInnerHTML={{ __html: renderMarkdownInline(data.title) }}
      />

      <div
        className="my-4 text-lg font-light leading-8 text-[#213343] [&_a]:border-b [&_a]:border-dotted [&_a]:border-current [&_a]:text-blue-500 [&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(data.text_before_list) }}
      />

      <ul className="my-4 list-disc space-y-1 pl-5 text-lg font-light leading-8 text-[#213343]">
        {items.map((item, index) => (
          <li key={index}>
            {isColonSeparated(item) ? (
              <>
                <strong dangerouslySetInnerHTML={{ __html: renderMarkdownInline(getItemLabel(item)) }} />{' '}
                <span dangerouslySetInnerHTML={{ __html: renderMarkdownInline(getItemContent(item)) }} />
              </>
            ) : (
              <span dangerouslySetInnerHTML={{ __html: renderMarkdownInline(item) }} />
            )}
          </li>
        ))}
      </ul>

      <div
        className="my-4 text-lg font-light leading-8 text-[#213343] [&_a]:border-b [&_a]:border-dotted [&_a]:border-current [&_a]:text-blue-500 [&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(data.text_after_list) }}
      />
    </>
  )
}
