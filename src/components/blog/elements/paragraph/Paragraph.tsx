'use client'

import { useCallback, useEffect, type FormEvent } from 'react'
import { renderMarkdown, renderMarkdownInline } from '@/lib/markdown'
import { BaseElement } from '../BaseElement'
import type { ElementComponentProps } from '../registry'
import { useElementsStore } from '@/stores/elements-store'
import { useInlineEdit } from '../inline/InlineEditProvider'
import { InlineEditorShell } from '../inline/InlineEditorShell'
import { useElementDraft } from '@/hooks/use-element-draft'
import { useElementSave } from '@/hooks/use-element-save'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

type HyperlinkMatch = {
  keyword: string
  description: string
  matched_positions: number[]
}

interface ParagraphProps extends ElementComponentProps {
  hyperlink?: {
    matched_keywords?: {
      title?: HyperlinkMatch[]
      text?: HyperlinkMatch[]
    }
  } | null
}

type ParagraphContent = {
  title?: string
  text?: string
}

const createHyperlinkedText = (text: string, keywords: HyperlinkMatch[]): string => {
  const keywordMap: Record<string, string> = keywords.reduce((acc, { keyword }) => {
    acc[keyword.toLowerCase()] = keyword
    return acc
  }, {} as Record<string, string>)

  const words = text.split(/(\s+)/)

  const hyperlinkedWords = words.map((word, i) => {
    const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/gi, '')

    if (keywordMap[cleanWord]) {
      const nextWord = words[i + 2]
      const nextCleanWord = nextWord ? nextWord.toLowerCase().replace(/[^a-z0-9]/gi, '') : ''

      if (!keywordMap[nextCleanWord]) {
        const originalKeyword = keywordMap[cleanWord]
        const match = word.match(/^([^\w]*)([\w]+)([^\w]*)$/)

        if (match) {
          const [, before, mainWord, after] = match
          return `${before}<a href="/example/${originalKeyword}" class="hyperlink">${mainWord}</a>${after}`
        }

        return `<a href="/example/${originalKeyword}" class="hyperlink">${word}</a>`
      }
    }

    return word
  })

  return hyperlinkedWords.join('')
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
  const updateElement = useElementsStore((s) => s.updateElement)
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

  const formattedTitle = hyperlink?.matched_keywords?.title?.length
    ? renderMarkdownInline(createHyperlinkedText(viewContent.title ?? '', hyperlink.matched_keywords.title))
    : renderMarkdownInline(viewContent.title ?? '')

  let formattedTextInput = viewContent.text ?? ''
  formattedTextInput = formattedTextInput.replace(/(<br\s*\/?>)(?!<br\s*\/?>)/g, '<br/><br/>')
  formattedTextInput = formattedTextInput.replace(/(<br\s*\/?>){3,}/g, '<br/><br/>')
  if (hyperlink?.matched_keywords?.text?.length) {
    formattedTextInput = createHyperlinkedText(formattedTextInput, hyperlink.matched_keywords.text)
  }
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
                className="text-2xl font-semibold custom-content"
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
                className="min-h-[140px] resize-none overflow-hidden my-[15px] text-[1.125rem] font-light leading-[1.77778] text-foreground custom-content"
              />
            </div>
          </div>
        </InlineEditorShell>
      ) : (
        <div
          className={`space-y-2 ${isEditModeEnabled ? 'cursor-text rounded-sm transition hover:ring-1 hover:ring-primary/30' : ''}`}
          onClick={() => isEditModeEnabled && startEditing(elementId)}
        >
          <h3 className="mb-3 text-2xl font-semibold custom-content" dangerouslySetInnerHTML={{ __html: formattedTitle }} />
          <p className="my-[15px] text-[1.125rem] font-light leading-[1.77778] text-foreground custom-content" dangerouslySetInnerHTML={{ __html: formattedText }} />
        </div>
      )}
    </BaseElement>
  )
}
