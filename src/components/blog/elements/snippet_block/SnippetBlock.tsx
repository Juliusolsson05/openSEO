'use client'

import { useCallback, useEffect } from 'react'
import { BaseElement } from '../BaseElement'
import type { ElementComponentProps } from '../registry'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'
import { useElementsApi } from '@/hooks/use-elements-api'
import { useInlineEdit } from '../inline/InlineEditProvider'
import { InlineEditorShell } from '../inline/InlineEditorShell'
import { useElementDraft } from '@/hooks/use-element-draft'
import { useElementSave } from '@/hooks/use-element-save'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { applyHyperlinks } from '../hyperlink-utils'

type SnippetContent = { title?: string; text?: string }

export function SnippetBlock({ content, blogId, elementId, onContentUpdated, onElementDeleted, hyperlink }: ElementComponentProps) {
  const { updateElement } = useElementsApi()
  const { isEditModeEnabled, isEditing, startEditing, stopEditing } = useInlineEdit()
  const editing = isEditing(elementId)

  const initial = (content ?? { title: '', text: '' }) as SnippetContent
  const { draft, patch, reset, commit, rebase, isDirty } = useElementDraft<SnippetContent>(initial)

  useEffect(() => { rebase((content ?? { title: '', text: '' }) as SnippetContent) }, [content])

  const saveFn = useCallback(async (data: SnippetContent) => {
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

  const viewContent = (content ?? {}) as SnippetContent

  return (
    <BaseElement content={content} blogId={blogId} elementId={elementId} allowEdit={false} onContentUpdated={onContentUpdated} onElementDeleted={onElementDeleted}>
      {editing ? (
        <InlineEditorShell title="Snippet" isDirty={isDirty} status={status} error={error} onSave={handleSave} onCancel={handleCancel}>
          <div data-inline-edit-root="true" className="rounded-lg border border-border bg-secondary/50 p-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`snippet-title-${elementId}`}>Title</Label>
              <Input
                id={`snippet-title-${elementId}`}
                value={draft.title ?? ''}
                onChange={(e) => patch({ title: e.target.value })}
                placeholder="Snippet title"
                className="text-[18px] font-semibold"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`snippet-text-${elementId}`}>Text</Label>
              <Textarea
                id={`snippet-text-${elementId}`}
                value={draft.text ?? ''}
                onChange={(e) => patch({ text: e.target.value })}
                placeholder="Snippet text"
                className="min-h-[120px] text-[15px] font-light leading-relaxed"
              />
            </div>
          </div>
        </InlineEditorShell>
      ) : (
        <div
          className={`rounded-lg border border-border bg-secondary/50 p-5 space-y-4 ${isEditModeEnabled ? 'cursor-text rounded-sm transition hover:ring-1 hover:ring-primary/30' : ''}`}
          onClick={() => isEditModeEnabled && startEditing(elementId)}
        >
          <h2 className="mb-4 text-[22px] font-semibold leading-tight tracking-tight text-foreground" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(applyHyperlinks(viewContent.title ?? '', hyperlink, 'title')) }} />
          <p className="text-[17px] font-light leading-[1.8] text-foreground [&_strong]:font-semibold [&_em]:font-[450]" dangerouslySetInnerHTML={{ __html: renderMarkdown(applyHyperlinks(viewContent.text ?? '', hyperlink, 'text')) }} />
        </div>
      )}
    </BaseElement>
  )
}
