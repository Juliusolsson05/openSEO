'use client'

import { useEffect, useState } from 'react'
import { BaseElement } from '../BaseElement'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'
import type { ElementComponentProps } from '../registry'
import { useElementsStore } from '@/stores/elements-store'
import { useAutoSave } from '@/hooks/use-auto-save'
import { InlineRichText, InlineTable, InlineText, SaveIndicator, useInlineEdit } from '../inline'

interface TableContent {
  title?: string
  text_before?: string
  headers?: string[]
  rows?: string[][]
  text_after?: string
}

export function Table({ content, blogId, elementId, onContentUpdated, onElementDeleted }: ElementComponentProps) {
  const [localContent, setLocalContent] = useState<TableContent>((content ?? {}) as TableContent)
  const updateElement = useElementsStore((s) => s.updateElement)
  const { isEditing, startEditing } = useInlineEdit()
  const editing = isEditing(elementId)

  useEffect(() => setLocalContent((content ?? {}) as TableContent), [content])

  const { save, flush, status } = useAutoSave(async (next) => {
    const result = await updateElement(elementId, next, blogId)
    if (result.success) onContentUpdated?.(next)
    return result.success
  })

  const handleChange = (next: TableContent) => {
    setLocalContent(next)
    void save(next)
  }

  const headers = Array.isArray(localContent.headers) ? localContent.headers : []
  const rows = Array.isArray(localContent.rows) ? localContent.rows : []

  return (
    <BaseElement content={localContent} blogId={blogId} elementId={elementId} allowEdit={false} onContentUpdated={onContentUpdated} onElementDeleted={onElementDeleted}>
      <div className="space-y-3">
        {editing ? (
          <>
            <InlineText elementId={elementId} value={localContent.title ?? ''} onChange={(value) => handleChange({ ...localContent, title: value })} onBlur={() => void flush()} as="h3" className="mb-6 text-2xl font-semibold" placeholder="Table title" />
            <InlineRichText elementId={elementId} value={localContent.text_before ?? ''} onChange={(value) => handleChange({ ...localContent, text_before: value })} onBlur={() => void flush()} className="my-6" placeholder="Text before table" />
            <InlineTable headers={headers} rows={rows} onChange={(nextHeaders, nextRows) => handleChange({ ...localContent, headers: nextHeaders, rows: nextRows })} className="my-8" />
            <InlineRichText elementId={elementId} value={localContent.text_after ?? ''} onChange={(value) => handleChange({ ...localContent, text_after: value })} onBlur={() => void flush()} className="my-6" placeholder="Text after table" />
          </>
        ) : (
          <div className="cursor-text" onClick={() => startEditing(elementId)}>
            <h3 className="mb-6 text-2xl font-semibold" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(localContent.title ?? '') }} />
            {localContent.text_before ? <p className="my-6" dangerouslySetInnerHTML={{ __html: renderMarkdown(localContent.text_before) }} /> : null}
            <div className="my-8 overflow-x-auto rounded-lg border shadow-sm">
              <table className="w-full border-separate border-spacing-0">
                <thead>
                  <tr className="bg-muted/50">
                    {headers.map((header, index) => (
                      <th key={index} className="border-b px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(header) }} />
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="border-b px-4 py-3 text-sm" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(cell) }} />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {localContent.text_after ? <p className="my-6" dangerouslySetInnerHTML={{ __html: renderMarkdown(localContent.text_after) }} /> : null}
          </div>
        )}
        <SaveIndicator status={status} />
      </div>
    </BaseElement>
  )
}
