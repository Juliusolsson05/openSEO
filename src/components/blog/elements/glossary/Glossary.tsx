'use client'

import { useCallback, useEffect } from 'react'
import { Plus, Trash2, BookOpen } from 'lucide-react'
import { renderMarkdownInline } from '@/lib/markdown'
import { BaseElement } from '../BaseElement'
import type { ElementComponentProps } from '../registry'
import { useElementsApi } from '@/hooks/use-elements-api'
import { useInlineEdit } from '../inline/InlineEditProvider'
import { InlineEditorShell } from '../inline/InlineEditorShell'
import { useElementDraft } from '@/hooks/use-element-draft'
import { useElementSave } from '@/hooks/use-element-save'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

import type { GlossaryTerm, GlossaryContent } from '@/types/content-elements'

/** Normalize both formats: array of {term, definition} OR Record<string, string> */
function normalizeContent(raw: unknown): GlossaryContent {
  const obj = (raw ?? {}) as Record<string, unknown>
  const title = typeof obj.title === 'string' ? obj.title : 'Glossary'

  if (Array.isArray(obj.terms)) {
    return {
      title,
      terms: obj.terms.map((t: any) => ({
        term: String(t?.term ?? ''),
        definition: String(t?.definition ?? ''),
      })),
    }
  }

  if (obj.terms && typeof obj.terms === 'object') {
    return {
      title,
      terms: Object.entries(obj.terms as Record<string, string>).map(([term, definition]) => ({
        term,
        definition: String(definition ?? ''),
      })),
    }
  }

  return { title, terms: [] }
}

export function Glossary({ content, blogId, elementId, onContentUpdated, onElementAdded, onElementDeleted }: ElementComponentProps) {
  const { updateElement } = useElementsApi()
  const { isEditModeEnabled, isEditing, startEditing, stopEditing } = useInlineEdit()
  const editing = isEditing(elementId)

  const initial = normalizeContent(content)
  const { draft, patch, reset, commit, rebase, isDirty } = useElementDraft<GlossaryContent>(initial)

  useEffect(() => { rebase(normalizeContent(content)) }, [content])

  const saveFn = useCallback(async (data: GlossaryContent) => {
    const result = await updateElement(elementId, data, blogId)
    if (result.success) onContentUpdated?.(data)
    return result
  }, [updateElement, elementId, blogId, onContentUpdated])

  const { save, status, error } = useElementSave(saveFn)

  const handleSave = async () => {
    if (!isDirty) return
    const ok = await save(draft)
    if (ok) { commit(); stopEditing() }
  }

  const handleCancel = () => { reset(); stopEditing() }

  const terms = Array.isArray(draft.terms) ? draft.terms : []

  const updateTerm = (index: number, key: keyof GlossaryTerm, value: string) => {
    const next = [...terms]
    next[index] = { ...next[index], [key]: value }
    patch({ terms: next })
  }

  const addTerm = () => patch({ terms: [...terms, { term: '', definition: '' }] })
  const removeTerm = (index: number) => patch({ terms: terms.filter((_, i) => i !== index) })

  const view = normalizeContent(content)

  return (
    <BaseElement content={content} blogId={blogId} elementId={elementId} allowEdit={false} onContentUpdated={onContentUpdated} onElementAdded={onElementAdded} onElementDeleted={onElementDeleted}>
      {editing ? (
        <InlineEditorShell title="Glossary" isDirty={isDirty} status={status} error={error} onSave={handleSave} onCancel={handleCancel}>
          <div data-inline-edit-root="true" className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={draft.title ?? ''} onChange={(e) => patch({ title: e.target.value })} placeholder="Glossary title" className="text-[18px] font-semibold" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Terms</Label>
                <Button type="button" variant="outline" size="sm" onClick={addTerm}>
                  <Plus className="mr-1 h-4 w-4" /> Add term
                </Button>
              </div>

              {terms.map((t, index) => (
                <div key={index} className="rounded-lg border p-4 space-y-3">
                  <div className="space-y-1.5">
                    <Label>Term</Label>
                    <Input value={t.term} onChange={(e) => updateTerm(index, 'term', e.target.value)} placeholder="Term" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Definition</Label>
                    <Input value={t.definition} onChange={(e) => updateTerm(index, 'definition', e.target.value)} placeholder="Definition" />
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeTerm(index)}>
                    <Trash2 className="mr-1 h-4 w-4" /> Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </InlineEditorShell>
      ) : (
        <div
          className={isEditModeEnabled ? 'cursor-text rounded-sm transition hover:ring-1 hover:ring-primary/30' : ''}
          onClick={() => isEditModeEnabled && startEditing(elementId)}
        >
          <h2 className="mb-4 flex items-center gap-2 text-[22px] font-semibold leading-tight tracking-tight text-foreground">
            <BookOpen className="h-5 w-5 text-primary" />
            <span dangerouslySetInnerHTML={{ __html: renderMarkdownInline(view.title ?? '') }} />
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {view.terms.map((t, index) => (
              <div key={index} className="rounded-lg border border-border bg-card p-4">
                <dt className="text-[15px] font-semibold text-foreground" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(t.term) }} />
                <dd className="mt-1 text-[14px] font-light leading-[1.6] text-muted-foreground" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(t.definition) }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </BaseElement>
  )
}
