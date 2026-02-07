'use client'

import { useEffect, useMemo, useState } from 'react'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'
import { BaseElement } from '../BaseElement'
import type { ElementComponentProps } from '../registry'
import { useElementsStore } from '@/stores/elements-store'
import { useAutoSave } from '@/hooks/use-auto-save'
import { InlineRichText, InlineText, SaveIndicator, useInlineEdit } from '../inline'

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

type ParagraphContent = {
  title?: string
  text?: string
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
  const [localContent, setLocalContent] = useState<ParagraphContent>((content ?? {}) as ParagraphContent)
  const updateElement = useElementsStore((s) => s.updateElement)
  const { isEditing, startEditing } = useInlineEdit()
  const editing = isEditing(elementId)

  useEffect(() => {
    setLocalContent((content ?? {}) as ParagraphContent)
  }, [content])

  const { save, flush, status } = useAutoSave(async (next) => {
    const result = await updateElement(elementId, next, blogId)
    if (result.success) onContentUpdated?.(next)
    return result.success
  })

  const handleContentChange = (key: keyof ParagraphContent, value: string) => {
    const next = { ...localContent, [key]: value }
    setLocalContent(next)
    void save(next)
  }

  const formattedTitle = useMemo(() => {
    const title = localContent?.title ?? ''
    if (hyperlink?.matched_keywords?.title?.length) {
      return renderMarkdownInline(createHyperlinkedText(title, hyperlink.matched_keywords.title))
    }
    return renderMarkdownInline(title)
  }, [localContent?.title, hyperlink?.matched_keywords?.title])

  const formattedText = useMemo(() => {
    let text = localContent?.text ?? ''
    text = text.replace(/(<br\s*\/?>)(?!<br\s*\/?>)/g, '<br/><br/>')
    text = text.replace(/(<br\s*\/?>){3,}/g, '<br/><br/>')

    if (hyperlink?.matched_keywords?.text?.length) {
      text = createHyperlinkedText(text, hyperlink.matched_keywords.text)
    }

    return renderMarkdown(text)
  }, [localContent?.text, hyperlink?.matched_keywords?.text])

  return (
    <BaseElement
      content={localContent}
      blogId={blogId}
      elementId={elementId}
      allowEdit={false}
      onContentUpdated={onContentUpdated}
      onElementDeleted={onElementDeleted}
      onElementAdded={onElementAdded}
    >
      <div className="space-y-2">
        {editing ? (
          <>
            <InlineText
              elementId={elementId}
              value={localContent.title ?? ''}
              onChange={(value) => handleContentChange('title', value)}
              onBlur={() => void flush()}
              as="h3"
              className="mb-3 text-2xl font-semibold custom-content"
              placeholder="Paragraph title"
            />
            <InlineRichText
              elementId={elementId}
              value={localContent.text ?? ''}
              onChange={(value) => handleContentChange('text', value)}
              onBlur={() => void flush()}
              className="my-[15px] text-[1.125rem] font-light leading-[1.77778] text-foreground custom-content"
              placeholder="Write your paragraph..."
            />
          </>
        ) : (
          <>
            <h3
              className="mb-3 text-2xl font-semibold custom-content cursor-text"
              onClick={() => startEditing(elementId)}
              dangerouslySetInnerHTML={{ __html: formattedTitle }}
            />
            <p
              className="my-[15px] text-[1.125rem] font-light leading-[1.77778] text-foreground custom-content cursor-text"
              onClick={() => startEditing(elementId)}
              dangerouslySetInnerHTML={{ __html: formattedText }}
            />
          </>
        )}

        <SaveIndicator status={status} />
      </div>
    </BaseElement>
  )
}
