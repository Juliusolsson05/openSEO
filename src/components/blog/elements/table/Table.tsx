'use client'

import { useCallback, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { BaseElement } from '../BaseElement'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'
import type { ElementComponentProps } from '../registry'
import { useElementsApi } from '@/hooks/use-elements-api'
import { useInlineEdit } from '../inline/InlineEditProvider'
import { InlineEditorShell } from '../inline/InlineEditorShell'
import { useElementDraft } from '@/hooks/use-element-draft'
import { useElementSave } from '@/hooks/use-element-save'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { applyHyperlinks } from '../hyperlink-utils'

import type { TableContent } from '@/types/content-elements'

export function Table({ content, blogId, elementId, onContentUpdated, onElementDeleted, hyperlink }: ElementComponentProps) {
  const { updateElement } = useElementsApi()
  const { isEditModeEnabled, isEditing, startEditing, stopEditing } = useInlineEdit()
  const editing = isEditing(elementId)

  const initial = (content ?? { title: '', text_before: '', headers: [], rows: [], text_after: '' }) as TableContent
  const { draft, patch, reset, commit, rebase, isDirty } = useElementDraft<TableContent>(initial)

  useEffect(() => { rebase((content ?? { title: '', text_before: '', headers: [], rows: [], text_after: '' }) as TableContent) }, [content])

  const saveFn = useCallback(async (data: TableContent) => {
    const result = await updateElement(elementId, data, blogId)
    if (result.success) onContentUpdated?.(data)
    return result
  }, [updateElement, elementId, blogId, onContentUpdated])

  const { save, status, error } = useElementSave(saveFn)

  const handleSave = async () => {
    if (!isDirty) return
    const ok = await save(draft)
    if (ok) {
      commit()
      stopEditing()
    }
  }

  const handleCancel = () => {
    reset()
    stopEditing()
  }

  const headers = Array.isArray(draft.headers) ? draft.headers : []
  const rows = Array.isArray(draft.rows) ? draft.rows : []

  const updateHeader = (index: number, value: string) => {
    const next = [...headers]
    next[index] = value
    patch({ headers: next })
  }

  const addColumn = () => {
    patch({
      headers: [...headers, ''],
      rows: rows.map((row) => [...row, '']),
    })
  }

  const removeColumn = (index: number) => {
    patch({
      headers: headers.filter((_, i) => i !== index),
      rows: rows.map((row) => row.filter((_, i) => i !== index)),
    })
  }

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const nextRows = rows.map((row) => [...row])
    if (!nextRows[rowIndex]) nextRows[rowIndex] = []
    nextRows[rowIndex][colIndex] = value
    patch({ rows: nextRows })
  }

  const addRow = () => {
    patch({ rows: [...rows, new Array(headers.length).fill('')] })
  }

  const removeRow = (rowIndex: number) => {
    patch({ rows: rows.filter((_, i) => i !== rowIndex) })
  }

  const viewContent = (content ?? {}) as TableContent
  const viewHeaders = Array.isArray(viewContent.headers) ? viewContent.headers : []
  const viewRows = Array.isArray(viewContent.rows) ? viewContent.rows : []

  return (
    <BaseElement content={content} blogId={blogId} elementId={elementId} allowEdit={false} onContentUpdated={onContentUpdated} onElementDeleted={onElementDeleted}>
      {editing ? (
        <InlineEditorShell title="Table" isDirty={isDirty} status={status} error={error} onSave={handleSave} onCancel={handleCancel}>
          <div data-inline-edit-root="true" className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={draft.title ?? ''} onChange={(e) => patch({ title: e.target.value })} placeholder="Table title" className="text-[18px] font-semibold" />
            </div>

            <div className="space-y-1.5">
              <Label>Text before table</Label>
              <Textarea value={draft.text_before ?? ''} onChange={(e) => patch({ text_before: e.target.value })} placeholder="Text before table" rows={4} className="min-h-[120px] text-[15px] font-light leading-relaxed" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Headers</Label>
                <Button type="button" variant="outline" size="sm" onClick={addColumn}>
                  <Plus className="mr-1 h-4 w-4" /> Add column
                </Button>
              </div>
              <div className="space-y-1.5">
                {headers.map((header, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input value={header} onChange={(e) => updateHeader(index, e.target.value)} placeholder={`Header ${index + 1}`} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeColumn(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Rows</Label>
                <Button type="button" variant="outline" size="sm" onClick={addRow}>
                  <Plus className="mr-1 h-4 w-4" /> Add row
                </Button>
              </div>
              <div className="space-y-1.5">
                {rows.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex items-start gap-2">
                    <div className="grid flex-1 gap-2" style={{ gridTemplateColumns: `repeat(${Math.max(headers.length, 1)}, minmax(0, 1fr))` }}>
                      {new Array(Math.max(headers.length, 1)).fill(null).map((_, colIndex) => (
                        <Input
                          key={colIndex}
                          value={row[colIndex] ?? ''}
                          onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                          placeholder={`Row ${rowIndex + 1}, col ${colIndex + 1}`}
                        />
                      ))}
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeRow(rowIndex)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Text after table</Label>
              <Textarea value={draft.text_after ?? ''} onChange={(e) => patch({ text_after: e.target.value })} placeholder="Text after table" rows={4} className="min-h-[120px] text-[15px] font-light leading-relaxed" />
            </div>
          </div>
        </InlineEditorShell>
      ) : (
        <div
          className={isEditModeEnabled ? 'cursor-text rounded-sm transition hover:ring-1 hover:ring-primary/30' : ''}
          onClick={() => isEditModeEnabled && startEditing(elementId)}
        >
          <h3 className="mb-4 text-[22px] font-semibold leading-tight tracking-tight text-foreground" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(applyHyperlinks(viewContent.title ?? '', hyperlink, 'title')) }} />
          {viewContent.text_before ? <p className="mt-3 text-[17px] font-light leading-[1.8] text-foreground [&_strong]:font-semibold [&_em]:font-[450]" dangerouslySetInnerHTML={{ __html: renderMarkdown(applyHyperlinks(viewContent.text_before, hyperlink, 'text_before')) }} /> : null}
          <div className="my-4 overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-secondary/50">
                  {viewHeaders.map((header, index) => (
                    <th key={index} className="border-b border-border px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-muted-foreground" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(header) }} />
                  ))}
                </tr>
              </thead>
              <tbody>
                {viewRows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="border-b border-border px-4 py-3 text-[15px] text-foreground" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(cell) }} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {viewContent.text_after ? <p className="mt-3 text-[17px] font-light leading-[1.8] text-foreground [&_strong]:font-semibold [&_em]:font-[450]" dangerouslySetInnerHTML={{ __html: renderMarkdown(applyHyperlinks(viewContent.text_after, hyperlink, 'text_after')) }} /> : null}
        </div>
      )}
    </BaseElement>
  )
}
