'use client'

import { useCallback, useEffect } from 'react'
import { BaseElement } from '../BaseElement'
import type { ElementComponentProps } from '../registry'
import { renderMarkdown } from '@/lib/markdown'
import { useElementsStore } from '@/stores/elements-store'
import { useInlineEdit } from '../inline/InlineEditProvider'
import { InlineEditorShell } from '../inline/InlineEditorShell'
import { useElementDraft } from '@/hooks/use-element-draft'
import { useElementSave } from '@/hooks/use-element-save'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { applyHyperlinks } from '../hyperlink-utils'

type ConclusionContent = {
  title?: string
  text?: string
}

const formatConclusionText = (value: string) => {
  let text = value
  text = text.replace(/(<br\s*\/?>)(?!<br\s*\/?>)/g, '<br/><br/>')
  text = text.replace(/(<br\s*\/?>){3,}/g, '<br/><br/>')
  return renderMarkdown(text)
}

export function Conclusion({ content, blogId, elementId, onContentUpdated, onElementDeleted, hyperlink }: ElementComponentProps) {
  const updateElement = useElementsStore((s) => s.updateElement)
  const { isEditModeEnabled, isEditing, startEditing, stopEditing } = useInlineEdit()
  const editing = isEditing(elementId)

  const initial = (content ?? { title: '', text: '' }) as ConclusionContent
  const { draft, patch, reset, commit, rebase, isDirty } = useElementDraft<ConclusionContent>(initial)

  useEffect(() => { rebase((content ?? { title: '', text: '' }) as ConclusionContent) }, [content])

  const saveFn = useCallback(async (data: ConclusionContent) => {
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

  const viewContent = (content ?? {}) as ConclusionContent

  return (
    <BaseElement
      content={content}
      blogId={blogId}
      elementId={elementId}
      allowEdit={false}
      allowDelete={false}
      allowAddElement={false}
      onContentUpdated={onContentUpdated}
      onElementDeleted={onElementDeleted}
    >
      {editing ? (
        <InlineEditorShell title="Conclusion" isDirty={isDirty} status={status} error={error} onSave={handleSave} onCancel={handleCancel}>
          <div data-inline-edit-root="true" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`conclusion-title-${elementId}`}>Title</Label>
              <Input
                id={`conclusion-title-${elementId}`}
                value={draft.title ?? ''}
                onChange={(e) => patch({ title: e.target.value })}
                placeholder="Conclusion"
                className="text-2xl font-semibold"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`conclusion-text-${elementId}`}>Text</Label>
              <Textarea
                id={`conclusion-text-${elementId}`}
                value={draft.text ?? ''}
                onChange={(e) => patch({ text: e.target.value })}
                placeholder="Write conclusion..."
                className="min-h-[140px] custom-content my-[15px] text-lg font-light leading-[1.77778] text-foreground"
              />
            </div>
          </div>
        </InlineEditorShell>
      ) : (
        <div
          className={`space-y-2 ${isEditModeEnabled ? 'cursor-text rounded-sm transition hover:ring-1 hover:ring-primary/30' : ''}`}
          onClick={() => isEditModeEnabled && startEditing(elementId)}
        >
          <h2 className="mb-3 text-2xl font-semibold">{viewContent.title ?? 'Conclusion'}</h2>
          <div
            className="custom-content my-[15px] text-lg font-light leading-[1.77778] text-foreground"
            dangerouslySetInnerHTML={{ __html: formatConclusionText(applyHyperlinks(viewContent.text ?? '', hyperlink, 'text')) }}
          />
        </div>
      )}
    </BaseElement>
  )
}
