'use client'

import { useCallback, useEffect, type FormEvent } from 'react'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'
import { BaseElement } from '../BaseElement'
import type { ElementComponentProps } from '../registry'
import { useElementsApi } from '@/hooks/use-elements-api'
import { useInlineEdit } from '../inline/InlineEditProvider'
import { InlineEditorShell } from '../inline/InlineEditorShell'
import { useElementDraft } from '@/hooks/use-element-draft'
import { useElementSave } from '@/hooks/use-element-save'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { applyHyperlinks, type HyperlinkData } from '../hyperlink-utils'

interface ParagraphProps extends ElementComponentProps {
  hyperlink?: HyperlinkData
}

type ParagraphContent = {
  title?: string
  text?: string
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
  const { updateElement } = useElementsApi()
  const { isEditModeEnabled, isEditing, startEditing, stopEditing } = useInlineEdit()
  const editing = isEditing(elementId)

  const initial = (content ?? { title: '', text: '' }) as ParagraphContent
  const { draft, patch, reset, commit, rebase, isDirty } = useElementDraft<ParagraphContent>(initial)

  useEffect(() => { rebase((content ?? { title: '', text: '' }) as ParagraphContent) }, [content])

  const saveFn = useCallback(async (data: ParagraphContent) => {
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

  const handleAutoResize = (event: FormEvent<HTMLTextAreaElement>) => {
    const el = event.currentTarget
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  const viewContent = (content ?? {}) as ParagraphContent

  const formattedTitle = renderMarkdownInline(applyHyperlinks(viewContent.title ?? '', hyperlink, 'title'))

  let formattedTextInput = viewContent.text ?? ''
  formattedTextInput = formattedTextInput.replace(/(<br\s*\/?>)(?!<br\s*\/?>)/g, '<br/><br/>')
  formattedTextInput = formattedTextInput.replace(/(<br\s*\/?>){3,}/g, '<br/><br/>')
  formattedTextInput = applyHyperlinks(formattedTextInput, hyperlink, 'text')
  const formattedText = renderMarkdown(formattedTextInput)

  return (
    <BaseElement
      content={content}
      blogId={blogId}
      elementId={elementId}
      allowEdit={false}
      onContentUpdated={onContentUpdated}
      onElementDeleted={onElementDeleted}
      onElementAdded={onElementAdded}
    >
      {editing ? (
        <InlineEditorShell title="Paragraph" isDirty={isDirty} status={status} error={error} onSave={handleSave} onCancel={handleCancel}>
          <div data-inline-edit-root="true" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`paragraph-title-${elementId}`}>Title</Label>
              <Input
                id={`paragraph-title-${elementId}`}
                value={draft.title ?? ''}
                onChange={(e) => patch({ title: e.target.value })}
                placeholder="Paragraph title"
                className="text-[18px] font-semibold"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`paragraph-text-${elementId}`}>Text</Label>
              <Textarea
                id={`paragraph-text-${elementId}`}
                value={draft.text ?? ''}
                onChange={(e) => patch({ text: e.target.value })}
                onInput={handleAutoResize}
                placeholder="Write your paragraph..."
                className="min-h-[120px] resize-none overflow-hidden text-[15px] font-light leading-relaxed"
              />
            </div>
          </div>
        </InlineEditorShell>
      ) : (
        <div
          className={isEditModeEnabled ? 'cursor-text rounded-sm transition hover:ring-1 hover:ring-primary/30' : ''}
          onClick={() => isEditModeEnabled && startEditing(elementId)}
        >
          <h3 className="mb-3 text-[22px] font-semibold leading-tight tracking-tight text-foreground" dangerouslySetInnerHTML={{ __html: formattedTitle }} />
          <p className="mt-3 text-[17px] font-light leading-[1.8] text-foreground [&_strong]:font-semibold [&_em]:font-[450]" dangerouslySetInnerHTML={{ __html: formattedText }} />
        </div>
      )}
    </BaseElement>
  )
}
