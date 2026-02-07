'use client'

import { useEffect, useState } from 'react'
import { BaseElement } from '../BaseElement'
import type { ElementComponentProps } from '../registry'
import { renderMarkdownInline } from '@/lib/markdown'
import { useElementsStore } from '@/stores/elements-store'
import { useAutoSave } from '@/hooks/use-auto-save'
import { InlineText, SaveIndicator, useInlineEdit } from '../inline'

type QuoteContent = {
  text?: string
  quote?: string
  author?: string
  person?: string
  description?: string
}

export function Quote({ content, blogId, elementId, onContentUpdated, onElementDeleted }: ElementComponentProps) {
  const [localContent, setLocalContent] = useState<QuoteContent>((content ?? {}) as QuoteContent)
  const updateElement = useElementsStore((s) => s.updateElement)
  const { isEditing, startEditing } = useInlineEdit()
  const editing = isEditing(elementId)

  useEffect(() => setLocalContent((content ?? {}) as QuoteContent), [content])

  const { save, flush, status } = useAutoSave(async (next) => {
    const result = await updateElement(elementId, next, blogId)
    if (result.success) onContentUpdated?.(next)
    return result.success
  })

  const handleChange = (key: keyof QuoteContent, value: string) => {
    const next = { ...localContent, [key]: value }
    setLocalContent(next)
    void save(next)
  }

  const quote = localContent.quote ?? localContent.text ?? ''
  const author = localContent.author ?? localContent.person ?? ''
  const description = localContent.description ?? ''

  return (
    <BaseElement content={localContent} blogId={blogId} elementId={elementId} allowEdit={false} onContentUpdated={onContentUpdated} onElementDeleted={onElementDeleted}>
      <div className="space-y-2 rounded-lg bg-muted/60 p-6">
        {editing ? (
          <>
            <InlineText elementId={elementId} value={localContent.text ?? ''} onChange={(v) => handleChange('text', v)} onBlur={() => void flush()} multiline className="text-lg" placeholder="Intro text (optional)" />
            <InlineText elementId={elementId} value={quote} onChange={(v) => handleChange('quote', v)} onBlur={() => void flush()} multiline className="text-3xl" placeholder="Quote" />
            <InlineText elementId={elementId} value={author} onChange={(v) => handleChange('author', v)} onBlur={() => void flush()} className="text-2xl" placeholder="Author" />
            <InlineText elementId={elementId} value={description} onChange={(v) => handleChange('description', v)} onBlur={() => void flush()} className="text-base" placeholder="Author description" />
          </>
        ) : (
          <div className="cursor-text" onClick={() => startEditing(elementId)}>
            {localContent.text ? <p className="mb-3" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(localContent.text) }} /> : null}
            <p className="text-3xl" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(quote) }} />
            <p className="mt-4 text-2xl">— <span dangerouslySetInnerHTML={{ __html: renderMarkdownInline(author) }} />
              {description ? <span className="ml-1 text-base font-light" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(description) }} /> : null}
            </p>
          </div>
        )}
        <SaveIndicator status={status} />
      </div>
    </BaseElement>
  )
}
