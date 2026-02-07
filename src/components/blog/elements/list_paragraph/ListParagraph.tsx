'use client'

import { useEffect, useState } from 'react'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'
import { BaseElement } from '../BaseElement'
import { useElementsStore } from '@/stores/elements-store'
import { useAutoSave } from '@/hooks/use-auto-save'
import { InlineList, InlineRichText, InlineText, SaveIndicator, useInlineEdit } from '../inline'
import type { ElementComponentProps } from '../registry'

type ListParagraphContent = {
  title?: string
  text_before_list?: string
  list_items?: string[]
  text_after_list?: string
}

export function ListParagraph({ content, blogId, elementId, onContentUpdated, onElementDeleted }: ElementComponentProps) {
  const [localContent, setLocalContent] = useState<ListParagraphContent>((content ?? {}) as ListParagraphContent)
  const updateElement = useElementsStore((s) => s.updateElement)
  const { isEditing, startEditing } = useInlineEdit()
  const editing = isEditing(elementId)

  useEffect(() => setLocalContent((content ?? {}) as ListParagraphContent), [content])

  const { save, flush, status } = useAutoSave(async (next) => {
    const result = await updateElement(elementId, next, blogId)
    if (result.success) onContentUpdated?.(next)
    return result.success
  })

  const handleChange = (key: keyof ListParagraphContent, value: string | string[]) => {
    const next = { ...localContent, [key]: value }
    setLocalContent(next)
    void save(next)
  }

  const items = Array.isArray(localContent.list_items) ? localContent.list_items : []

  return (
    <BaseElement content={localContent} blogId={blogId} elementId={elementId} allowEdit={false} onContentUpdated={onContentUpdated} onElementDeleted={onElementDeleted}>
      <div className="space-y-3">
        {editing ? (
          <>
            <InlineText elementId={elementId} value={localContent.title ?? ''} onChange={(v) => handleChange('title', v)} onBlur={() => void flush()} as="h3" className="mb-3 text-xl font-medium" placeholder="Title" />
            <InlineRichText elementId={elementId} value={localContent.text_before_list ?? ''} onChange={(v) => handleChange('text_before_list', v)} onBlur={() => void flush()} className="my-4 text-lg font-light leading-8" placeholder="Text before list" />
            <InlineList items={items} onChange={(v) => handleChange('list_items', v)} placeholder="List item" className="my-4" />
            <InlineRichText elementId={elementId} value={localContent.text_after_list ?? ''} onChange={(v) => handleChange('text_after_list', v)} onBlur={() => void flush()} className="my-4 text-lg font-light leading-8" placeholder="Text after list" />
          </>
        ) : (
          <div onClick={() => startEditing(elementId)} className="cursor-text">
            <h3 className="mb-3 text-xl font-medium" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(localContent.title ?? '') }} />
            <div className="my-4 text-lg font-light leading-8" dangerouslySetInnerHTML={{ __html: renderMarkdown(localContent.text_before_list ?? '') }} />
            <ul className="my-4 list-disc space-y-1 pl-5 text-lg font-light leading-8 text-foreground">
              {items.map((item, index) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: renderMarkdownInline(item) }} />
              ))}
            </ul>
            <div className="my-4 text-lg font-light leading-8" dangerouslySetInnerHTML={{ __html: renderMarkdown(localContent.text_after_list ?? '') }} />
          </div>
        )}
        <SaveIndicator status={status} />
      </div>
    </BaseElement>
  )
}
