'use client'

import { useMemo } from 'react'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'
import { BaseElement } from '../BaseElement'
import type { ElementComponentProps } from '../registry'

type HyperlinkMatch = {
  keyword: string
  description: string
  matched_positions: number[]
}

interface ParagraphProps extends ElementComponentProps {
  hyperlink?: {
    matched_keywords?: {
      title?: HyperlinkMatch[]
      text?: HyperlinkMatch[]
    }
  } | null
}

const createHyperlinkedText = (text: string, keywords: HyperlinkMatch[]): string => {
  const keywordMap: Record<string, string> = keywords.reduce((acc, { keyword }) => {
    acc[keyword.toLowerCase()] = keyword
    return acc
  }, {} as Record<string, string>)

  const words = text.split(/(\s+)/)

  const hyperlinkedWords = words.map((word, i) => {
    const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/gi, '')

    if (keywordMap[cleanWord]) {
      const nextWord = words[i + 2]
      const nextCleanWord = nextWord ? nextWord.toLowerCase().replace(/[^a-z0-9]/gi, '') : ''

      if (!keywordMap[nextCleanWord]) {
        const originalKeyword = keywordMap[cleanWord]
        const match = word.match(/^([^\w]*)([\w]+)([^\w]*)$/)

        if (match) {
          const [, before, mainWord, after] = match
          return `${before}<a href="/example/${originalKeyword}" class="hyperlink">${mainWord}</a>${after}`
        }

        return `<a href="/example/${originalKeyword}" class="hyperlink">${word}</a>`
      }
    }

    return word
  })

  return hyperlinkedWords.join('')
}

export function Paragraph({
  content,
  blogId,
  elementId,
  onContentUpdated,
  onElementDeleted,
  onElementAdded,
  hyperlink,
}: ParagraphProps) {
  const formattedTitle = useMemo(() => {
    const title = content?.title ?? ''
    if (hyperlink?.matched_keywords?.title?.length) {
      return renderMarkdownInline(createHyperlinkedText(title, hyperlink.matched_keywords.title))
    }
    return renderMarkdownInline(title)
  }, [content?.title, hyperlink?.matched_keywords?.title])

  const formattedText = useMemo(() => {
    let text = content?.text ?? ''
    text = text.replace(/(<br\s*\/?>)(?!<br\s*\/?>)/g, '<br/><br/>')
    text = text.replace(/(<br\s*\/?>){3,}/g, '<br/><br/>')

    if (hyperlink?.matched_keywords?.text?.length) {
      text = createHyperlinkedText(text, hyperlink.matched_keywords.text)
    }

    return renderMarkdown(text)
  }, [content?.text, hyperlink?.matched_keywords?.text])

  return (
    <BaseElement
      content={content}
      blogId={blogId}
      elementId={elementId}
      onContentUpdated={onContentUpdated}
      onElementDeleted={onElementDeleted}
      onElementAdded={onElementAdded}
    >
      <h3
        className="mb-3 text-2xl font-semibold custom-content"
        dangerouslySetInnerHTML={{ __html: formattedTitle }}
      />
      <p
        className="my-[15px] text-[1.125rem] font-light leading-[1.77778] text-foreground custom-content"
        dangerouslySetInnerHTML={{ __html: formattedText }}
      />
    </BaseElement>
  )
}
