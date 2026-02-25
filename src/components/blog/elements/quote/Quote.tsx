'use client'

import { useCallback, useEffect } from 'react'
import { BaseElement } from '../BaseElement'
import type { ElementComponentProps } from '../registry'
import { renderMarkdownInline } from '@/lib/markdown'
import { useElementsApi } from '@/hooks/use-elements-api'
import { useInlineEdit } from '../inline/InlineEditProvider'
import { InlineEditorShell } from '../inline/InlineEditorShell'
import { useElementDraft } from '@/hooks/use-element-draft'
import { useElementSave } from '@/hooks/use-element-save'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { applyHyperlinks } from '../hyperlink-utils'

type QuoteContent = {
  text?: string
  quote?: string
  author?: string
  person?: string
  description?: string
}

export function Quote({ content, blogId, elementId, onContentUpdated, onElementDeleted, hyperlink }: ElementComponentProps) {
  const { updateElement } = useElementsApi()
  const { isEditModeEnabled, isEditing, startEditing, stopEditing } = useInlineEdit()
  const editing = isEditing(elementId)

  const initial = (content ?? { text: '', quote: '', author: '', description: '' }) as QuoteContent
  const { draft, patch, reset, commit, rebase, isDirty } = useElementDraft<QuoteContent>(initial)

  useEffect(() => { rebase((content ?? { text: '', quote: '', author: '', description: '' }) as QuoteContent) }, [content])

  const saveFn = useCallback(async (data: QuoteContent) => {
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

  const viewContent = (content ?? {}) as QuoteContent
  const quote = viewContent.quote ?? viewContent.text ?? ''
  const author = viewContent.author ?? viewContent.person ?? ''
  const description = viewContent.description ?? ''

  return (
    <BaseElement content={content} blogId={blogId} elementId={elementId} allowEdit={false} onContentUpdated={onContentUpdated} onElementDeleted={onElementDeleted}>
      {editing ? (
        <InlineEditorShell title="Quote" isDirty={isDirty} status={status} error={error} onSave={handleSave} onCancel={handleCancel}>
          <div data-inline-edit-root="true" className="space-y-4 rounded-lg bg-muted/60 p-6">
            <div className="space-y-1.5">
              <Label htmlFor={`quote-intro-${elementId}`}>Intro text (optional)</Label>
              <Input
                id={`quote-intro-${elementId}`}
                value={draft.text ?? ''}
                onChange={(e) => patch({ text: e.target.value })}
                placeholder="Intro text (optional)"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`quote-quote-${elementId}`}>Quote</Label>
              <Textarea
                id={`quote-quote-${elementId}`}
                value={draft.quote ?? ''}
                onChange={(e) => patch({ quote: e.target.value })}
                placeholder="Quote"
                className="min-h-[120px] text-[15px] font-light leading-relaxed"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`quote-author-${elementId}`}>Author</Label>
              <Input
                id={`quote-author-${elementId}`}
                value={draft.author ?? draft.person ?? ''}
                onChange={(e) => patch({ author: e.target.value })}
                placeholder="Author"
                className="text-[18px] font-semibold"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`quote-description-${elementId}`}>Description</Label>
              <Input
                id={`quote-description-${elementId}`}
                value={draft.description ?? ''}
                onChange={(e) => patch({ description: e.target.value })}
                placeholder="Author description"
              />
            </div>
          </div>
        </InlineEditorShell>
      ) : (
        <div
          className={`rounded-lg border-l-4 border-primary bg-secondary/50 p-5 ${isEditModeEnabled ? 'cursor-text rounded-sm transition hover:ring-1 hover:ring-primary/30' : ''}`}
          onClick={() => isEditModeEnabled && startEditing(elementId)}
        >
          {viewContent.text ? <p className="text-[13px] text-muted-foreground" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(applyHyperlinks(viewContent.text, hyperlink, 'text')) }} /> : null}
          <p className="text-[20px] font-light italic leading-[1.7] text-foreground [&_strong]:font-semibold [&_em]:font-[450]" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(applyHyperlinks(quote, hyperlink, 'quote')) }} />
          <p className="mt-3 text-[15px] font-medium text-muted-foreground">— <span dangerouslySetInnerHTML={{ __html: renderMarkdownInline(applyHyperlinks(author, hyperlink, 'person')) }} />
            {description ? <span className="ml-1 text-[13px] text-muted-foreground" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(applyHyperlinks(description, hyperlink, 'description')) }} /> : null}
          </p>
        </div>
      )}
    </BaseElement>
  )
}
