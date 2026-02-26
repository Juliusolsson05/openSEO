'use client'

import { useCallback, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { BaseElement } from '../BaseElement'
import { renderMarkdownInline } from '@/lib/markdown'
import type { ElementComponentProps } from '../registry'
import { useElementsApi } from '@/hooks/use-elements-api'
import { useInlineEdit } from '../inline/InlineEditProvider'
import { InlineEditorShell } from '../inline/InlineEditorShell'
import { useElementDraft } from '@/hooks/use-element-draft'
import { useElementSave } from '@/hooks/use-element-save'
import { Input } from '@/components/ui/input'
import { applyHyperlinks } from '../hyperlink-utils'

import type { ProsAndConsContent } from '@/types/content-elements'

export function ProsAndCons({ content, blogId, elementId, onContentUpdated, onElementDeleted, hyperlink }: ElementComponentProps) {
  const { updateElement } = useElementsApi()
  const { isEditModeEnabled, isEditing, startEditing, stopEditing } = useInlineEdit()
  const editing = isEditing(elementId)

  const initial = (content ?? { title: '', pros: [], cons: [] }) as ProsAndConsContent
  const { draft, patch, reset, commit, rebase, isDirty } = useElementDraft<ProsAndConsContent>(initial)

  useEffect(() => { rebase((content ?? { title: '', pros: [], cons: [] }) as ProsAndConsContent) }, [content])

  const saveFn = useCallback(async (data: ProsAndConsContent) => {
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

  const pros = Array.isArray(draft.pros) ? draft.pros : []
  const cons = Array.isArray(draft.cons) ? draft.cons : []

  const updatePro = (index: number, value: string) => {
    const next = [...pros]
    next[index] = value
    patch({ pros: next })
  }

  const addPro = () => patch({ pros: [...pros, ''] })
  const removePro = (index: number) => patch({ pros: pros.filter((_, i) => i !== index) })

  const updateCon = (index: number, value: string) => {
    const next = [...cons]
    next[index] = value
    patch({ cons: next })
  }

  const addCon = () => patch({ cons: [...cons, ''] })
  const removeCon = (index: number) => patch({ cons: cons.filter((_, i) => i !== index) })

  const data = (content as ProsAndConsContent) ?? {}
  const viewPros = Array.isArray(data.pros) ? data.pros : []
  const viewCons = Array.isArray(data.cons) ? data.cons : []

  return (
    <BaseElement content={content} blogId={blogId} elementId={elementId} allowEdit onContentUpdated={onContentUpdated} onElementDeleted={onElementDeleted}>
      {editing ? (
        <InlineEditorShell
          title="Pros & Cons"
          isDirty={isDirty}
          status={status}
          error={error}
          onSave={handleSave}
          onCancel={handleCancel}
        >
          <div data-inline-edit-root="true" className="space-y-4">
            <Input
              value={draft.title ?? ''}
              onChange={(e) => patch({ title: e.target.value })}
              placeholder="Title"
              className="text-[18px] font-semibold"
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-2 border-b-2 border-emerald-600 pb-1.5 text-sm font-semibold text-emerald-600">Pros</h4>
                <div className="space-y-1.5">
                  {pros.map((pro, index) => (
                    <div key={index} className="flex items-center gap-1.5">
                      <span className="text-emerald-600 shrink-0">✓</span>
                      <Input
                        value={pro}
                        onChange={(e) => updatePro(index, e.target.value)}
                        placeholder="Pro item"
                        className="h-8 text-sm"
                      />
                      <button type="button" onClick={() => removePro(index)} className="shrink-0 rounded p-1 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={addPro} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                    <Plus className="h-3.5 w-3.5" /> Add pro
                  </button>
                </div>
              </div>

              <div>
                <h4 className="mb-2 border-b-2 border-rose-600 pb-1.5 text-sm font-semibold text-rose-600">Cons</h4>
                <div className="space-y-1.5">
                  {cons.map((con, index) => (
                    <div key={index} className="flex items-center gap-1.5">
                      <span className="text-rose-600 shrink-0">✕</span>
                      <Input
                        value={con}
                        onChange={(e) => updateCon(index, e.target.value)}
                        placeholder="Con item"
                        className="h-8 text-sm"
                      />
                      <button type="button" onClick={() => removeCon(index)} className="shrink-0 rounded p-1 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={addCon} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                    <Plus className="h-3.5 w-3.5" /> Add con
                  </button>
                </div>
              </div>
            </div>
          </div>
        </InlineEditorShell>
      ) : (
        <div
          className={isEditModeEnabled ? 'cursor-text rounded-sm transition hover:ring-1 hover:ring-primary/30' : ''}
          onClick={() => isEditModeEnabled && startEditing(elementId)}
        >
          {data.title ? (
            <h3 className="mb-4 text-[22px] font-semibold leading-tight tracking-tight text-foreground" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(applyHyperlinks(data.title, hyperlink, 'title')) }} />
          ) : null}
          {data.text_before ? <p className="mt-3 text-[17px] font-light leading-[1.8] text-foreground [&_strong]:font-semibold [&_em]:font-[450]" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(applyHyperlinks(data.text_before, hyperlink, 'text_before')) }} /> : null}
          <div className="my-4 grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <h4 className="mb-3 border-b-2 border-emerald-600 pb-2 text-[17px] font-semibold leading-snug text-foreground">Pros</h4>
              <ul className="space-y-2">{viewPros.map((pro, index) => <li key={index} className="text-[16px] font-light leading-[1.7] text-foreground"><span className="text-emerald-600">✓</span> <span dangerouslySetInnerHTML={{ __html: renderMarkdownInline(pro) }} /></li>)}</ul>
            </div>
            <div>
              <h4 className="mb-3 border-b-2 border-rose-600 pb-2 text-[17px] font-semibold leading-snug text-foreground">Cons</h4>
              <ul className="space-y-2">{viewCons.map((con, index) => <li key={index} className="text-[16px] font-light leading-[1.7] text-foreground"><span className="text-rose-600">✕</span> <span dangerouslySetInnerHTML={{ __html: renderMarkdownInline(con) }} /></li>)}</ul>
            </div>
          </div>
          {data.text_after ? <p className="mt-3 text-[17px] font-light leading-[1.8] text-foreground [&_strong]:font-semibold [&_em]:font-[450]" dangerouslySetInnerHTML={{ __html: renderMarkdownInline(applyHyperlinks(data.text_after, hyperlink, 'text_after')) }} /> : null}
        </div>
      )}
    </BaseElement>
  )
}
