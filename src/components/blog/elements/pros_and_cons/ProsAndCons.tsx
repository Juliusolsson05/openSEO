'use client'

import { useEffect, useState } from 'react'
import { BaseElement } from '../BaseElement'
import { renderMarkdownInline } from '@/lib/markdown'
import type { ElementComponentProps } from '../registry'
import { useElementsStore } from '@/stores/elements-store'
import { useAutoSave } from '@/hooks/use-auto-save'
import { InlineList, InlineText, SaveIndicator, useInlineEdit } from '../inline'

interface ProsAndConsContent {
  title?: string
  pros?: string[]
  cons?: string[]
}

export function ProsAndCons({ content, blogId, elementId, onContentUpdated, onElementDeleted }: ElementComponentProps) {
  const [localContent, setLocalContent] = useState<ProsAndConsContent>((content ?? {}) as ProsAndConsContent)
  const updateElement = useElementsStore((s) => s.updateElement)
  const { isEditing, startEditing } = useInlineEdit()
  const editing = isEditing(elementId)

  useEffect(() => setLocalContent((content ?? {}) as ProsAndConsContent), [content])

  const { save, flush, status } = useAutoSave(async (next) => {
    const result = await updateElement(elementId, next, blogId)
    if (result.success) onContentUpdated?.(next)
    return result.success
  })

  const handleChange = (next: ProsAndConsContent) => {
    setLocalContent(next)
    void save(next)
  }

  const pros = Array.isArray(localContent.pros) ? localContent.pros : []
  const cons = Array.isArray(localContent.cons) ? localContent.cons : []

  return (
    <BaseElement content={localContent} blogId={blogId} elementId={elementId} allowEdit={false} onContentUpdated={onContentUpdated} onElementDeleted={onElementDeleted}>
      <div className="space-y-3">
        {editing ? (
          <>
            <InlineText elementId={elementId} value={localContent.title ?? ''} onChange={(title) => handleChange({ ...localContent, title })} onBlur={() => void flush()} as="h3" className="mb-6 text-2xl font-semibold" placeholder="Pros and cons title" />
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                <h4 className="mb-3 border-b-2 border-emerald-600 pb-2 text-xl font-semibold text-emerald-600">Pros</h4>
                <InlineList items={pros} onChange={(nextPros) => handleChange({ ...localContent, pros: nextPros })} placeholder="Pro item" />
              </div>
              <div>
                <h4 className="mb-3 border-b-2 border-rose-600 pb-2 text-xl font-semibold text-rose-600">Cons</h4>
                <InlineList items={cons} onChange={(nextCons) => handleChange({ ...localContent, cons: nextCons })} placeholder="Con item" />
              </div>
            </div>
          </>
        ) : (
          <div className="cursor-text" onClick={() => startEditing(elementId)}>
            {localContent.title ? <h3 className="mb-6 text-2xl font-semibold" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(localContent.title) }} /> : null}
            <div className="my-8 grid grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                <h4 className="mb-3 border-b-2 border-emerald-600 pb-2 text-xl font-semibold text-emerald-600">Pros</h4>
                <ul className="space-y-3">{pros.map((pro, index) => <li key={index}>✓ <span dangerouslySetInnerHTML={{ __html: renderMarkdownInline(pro) }} /></li>)}</ul>
              </div>
              <div>
                <h4 className="mb-3 border-b-2 border-rose-600 pb-2 text-xl font-semibold text-rose-600">Cons</h4>
                <ul className="space-y-3">{cons.map((con, index) => <li key={index}>✕ <span dangerouslySetInnerHTML={{ __html: renderMarkdownInline(con) }} /></li>)}</ul>
              </div>
            </div>
          </div>
        )}
        <SaveIndicator status={status} />
      </div>
    </BaseElement>
  )
}
