'use client'

import { useEffect, useState } from 'react'
import { BaseElement } from '../BaseElement'
import type { ElementComponentProps } from '../registry'
import { useElementsStore } from '@/stores/elements-store'
import { useAutoSave } from '@/hooks/use-auto-save'
import { InlineFAQ, InlineText, SaveIndicator, useInlineEdit } from '../inline'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'

type FAQItem = { question: string; answer: string }
type FAQContent = { title?: string; items: FAQItem[] }

const normalizeContent = (content: any): FAQContent => {
  if (Array.isArray(content)) {
    return { title: 'FAQ', items: content as FAQItem[] }
  }
  return {
    title: content?.title ?? 'FAQ',
    items: Array.isArray(content?.items) ? content.items : [],
  }
}

export function FAQ({ content, blogId, elementId, onContentUpdated, onElementAdded, onElementDeleted }: ElementComponentProps) {
  const [localContent, setLocalContent] = useState<FAQContent>(normalizeContent(content))
  const updateElement = useElementsStore((s) => s.updateElement)
  const { isEditing, startEditing } = useInlineEdit()
  const editing = isEditing(elementId)

  useEffect(() => setLocalContent(normalizeContent(content)), [content])

  const { save, flush, status } = useAutoSave(async (next) => {
    const result = await updateElement(elementId, next, blogId)
    if (result.success) onContentUpdated?.(next)
    return result.success
  })

  const handleChange = (next: FAQContent) => {
    setLocalContent(next)
    void save(next)
  }

  return (
    <BaseElement content={localContent} blogId={blogId} elementId={elementId} allowEdit={false} allowDelete={false} allowAddElement={false} onContentUpdated={onContentUpdated} onElementAdded={onElementAdded} onElementDeleted={onElementDeleted}>
      <div className="space-y-4">
        {editing ? (
          <>
            <InlineText elementId={elementId} value={localContent.title ?? 'FAQ'} onChange={(value) => handleChange({ ...localContent, title: value })} onBlur={() => void flush()} as="h2" className="mt-12 text-3xl font-semibold tracking-tight" placeholder="FAQ title" />
            <InlineFAQ items={localContent.items} onChange={(items) => handleChange({ ...localContent, items })} />
          </>
        ) : (
          <div className="cursor-text" onClick={() => startEditing(elementId)}>
            <h2 className="mt-12 text-3xl font-semibold tracking-tight">{localContent.title || 'FAQ'}</h2>
            <div className="space-y-3 mt-4">
              {localContent.items.map((item, index) => (
                <div key={index} className="overflow-hidden rounded-lg border bg-card px-6 py-4">
                  <div className="font-medium" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(item.question) }} />
                  <div className="mt-2 prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: renderMarkdown(item.answer) }} />
                </div>
              ))}
            </div>
          </div>
        )}
        <SaveIndicator status={status} />
      </div>
    </BaseElement>
  )
}
