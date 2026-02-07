'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { api, apiPost, apiDelete } from '@/lib/api'
import { useBlogStore } from '@/stores/blog-store'
import { useEditorUiStore } from '@/stores/editor-ui-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  ImagePlus,
  Link2,
  KeyRound,
  RefreshCw,
  Trash2,
  Eye,
  Upload,
  Lock,
  Loader2,
  SquarePen,
} from 'lucide-react'

interface Props {
  postId: string | number
  onRefreshPost?: () => void
}

export default function AdminMenu({ postId, onRefreshPost }: Props) {
  const router = useRouter()
  const { fetchPost } = useBlogStore()
  const isEditModeEnabled = useEditorUiStore((s) => s.isEditModeEnabled)
  const setEditMode = useEditorUiStore((s) => s.setEditMode)

  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Dialogs
  const [showRegenerate, setShowRegenerate] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  // Publish
  const [showPublish, setShowPublish] = useState(false)
  const [dictionaries, setDictionaries] = useState<{ id: number; title: string }[]>([])
  const [publishDictId, setPublishDictId] = useState('')

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(t)
    }
  }, [toast])

  const run = async (id: string, label: string, fn: () => Promise<void>) => {
    setLoadingAction(id)
    try {
      await fn()
      setToast({ type: 'success', text: `${label} completed` })
      onRefreshPost?.()
    } catch (e: any) {
      setToast({ type: 'error', text: e?.message || `${label} failed` })
    } finally {
      setLoadingAction(null)
    }
  }

  const actions = [
    {
      id: 'images',
      icon: ImagePlus,
      label: 'Generate Images',
      fn: () => run('images', 'Generate Images', async () => {
        const { error } = await apiPost('/api/aurora/blog/images/generate/', { post_id: Number(postId), version: 2, magic_prompt: true, gpt_prompt: true })
        if (error) throw error
      }),
    },
    {
      id: 'sync-posts',
      icon: Link2,
      label: 'Sync Related Posts',
      fn: () => run('sync-posts', 'Sync Posts', async () => {
        const { error } = await apiPost('/api/aurora/blog/posts/sync/recommended/', { post_id: Number(postId) })
        if (error) throw error
      }),
    },
    {
      id: 'sync-keywords',
      icon: KeyRound,
      label: 'Sync Keywords',
      fn: () => run('sync-keywords', 'Sync Keywords', async () => {
        const { error } = await apiPost('/api/aurora/blog/posts/sync/keywords/', { post_id: Number(postId), dictionary_id: 1 })
        if (error) throw error
      }),
    },
  ]

  const openPublish = async () => {
    if (!dictionaries.length) {
      const { data } = await api<{ dictionaries: any[] }>('/api/aurora/dictionary/dictionaries/')
      if (data?.dictionaries) setDictionaries(data.dictionaries)
    }
    setShowPublish(true)
  }

  const doPublish = () => run('publish', 'Publish', async () => {
    setShowPublish(false)
    const { error } = await apiPost('/api/aurora/blog/posts/upload/', {
      post_id: Number(postId),
      dictionary_id: Number(publishDictId),
      export_method: 'elementor',
    })
    if (error) throw error
    setPublishDictId('')
  })

  const doRegenerate = () => run('regenerate', 'Regenerate', async () => {
    setShowRegenerate(false)
    setConfirmText('')
    const { error } = await apiPost('/api/aurora/blog/posts/regenerate/', { post_id: Number(postId) })
    if (error) throw error
  })

  const doDelete = () => run('delete', 'Delete', async () => {
    setShowDelete(false)
    setConfirmText('')
    const { error } = await apiDelete(`/api/aurora/blog/posts/delete/${postId}/`)
    if (error) throw error
    router.push('/blog')
  })

  const isLoading = (id: string) => loadingAction === id

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground mb-3">
            ACTIONS
          </p>

          <div className="mb-3 rounded-sm border border-border bg-secondary/40 px-2.5 py-2">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[12px] font-semibold text-foreground">
                  <SquarePen className="h-3.5 w-3.5 text-primary" />
                  Edit mode
                </p>
                <p className="text-[11px] text-muted-foreground">Enable inline element editing</p>
              </div>
              <Switch checked={isEditModeEnabled} onCheckedChange={(v) => setEditMode(v === true)} />
            </div>
          </div>

          <div className="space-y-1">
            {actions.map(({ id, icon: Icon, label, fn }) => (
              <button
                key={id}
                onClick={fn}
                disabled={!!loadingAction}
                className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-left transition-colors hover:bg-secondary disabled:opacity-50"
              >
                {loadingAction === id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
                ) : (
                  <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                )}
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="my-3 border-t border-border" />

          <div className="space-y-1">
            <button
              onClick={() => { setConfirmText(''); setShowRegenerate(true) }}
              disabled={!!loadingAction}
              className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-left transition-colors hover:bg-secondary disabled:opacity-50"
            >
              <RefreshCw className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span>Regenerate Post</span>
            </button>
            <button
              onClick={() => { setConfirmText(''); setShowDelete(true) }}
              disabled={!!loadingAction}
              className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-left text-destructive transition-colors hover:bg-destructive/5 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5 shrink-0" />
              <span>Delete Post</span>
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-[12px]"
              onClick={() => router.push(`/blog/${postId}/preview`)}
            >
              <Eye className="h-3 w-3" /> Preview
            </Button>
            <Button
              size="sm"
              className="gap-1.5 text-[12px]"
              onClick={openPublish}
              disabled={!!loadingAction}
            >
              <Upload className="h-3 w-3" /> Publish
            </Button>
          </div>

          {/* Toast */}
          {toast && (
            <p className={`mt-3 text-[11px] leading-tight ${
              toast.type === 'success' ? 'text-success' : 'text-destructive'
            }`}>
              {toast.text}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Regenerate confirm */}
      {showRegenerate && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowRegenerate(false)}>
          <div className="w-[400px] rounded-lg border border-border bg-background p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[15px] font-semibold mb-1">Regenerate Post</h3>
            <p className="text-[13px] text-muted-foreground mb-4">
              This will regenerate all content. Type <strong className="text-foreground">REGENERATE</strong> to confirm.
            </p>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="REGENERATE"
              className="mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowRegenerate(false)}>Cancel</Button>
              <Button
                size="sm"
                disabled={confirmText !== 'REGENERATE' || !!loadingAction}
                onClick={doRegenerate}
              >
                {loadingAction ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                Regenerate
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete confirm */}
      {showDelete && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowDelete(false)}>
          <div className="w-[400px] rounded-lg border border-border bg-background p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[15px] font-semibold mb-1">Delete Post</h3>
            <p className="text-[13px] text-muted-foreground mb-4">
              This action is irreversible. Type <strong className="text-foreground">DELETE</strong> to confirm.
            </p>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowDelete(false)}>Cancel</Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={confirmText !== 'DELETE' || !!loadingAction}
                onClick={doDelete}
              >
                {loadingAction ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                Delete
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Publish flow */}
      {showPublish && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowPublish(false)}>
          <div className="w-[400px] rounded-lg border border-border bg-background p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[15px] font-semibold mb-1">Publish Post</h3>
            <p className="text-[13px] text-muted-foreground mb-4">
              Select a dictionary and export method to publish.
            </p>

            <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5 block">Dictionary</label>
            <select
              value={publishDictId}
              onChange={(e) => setPublishDictId(e.target.value)}
              className="mb-3 h-8 w-full rounded-md border border-border bg-background px-2 text-[13px] focus:border-primary focus:outline-none"
            >
              <option value="">Select dictionary…</option>
              {dictionaries.map((d) => (
                <option key={d.id} value={String(d.id)}>{d.title}</option>
              ))}
            </select>

            <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5 block">Export Method</label>
            <select
              className="mb-4 h-8 w-full rounded-md border border-border bg-background px-2 text-[13px]"
              defaultValue="elementor"
              disabled
            >
              <option value="elementor">Elementor</option>
            </select>

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowPublish(false)}>Cancel</Button>
              <Button
                size="sm"
                disabled={!publishDictId || !!loadingAction}
                onClick={doPublish}
              >
                {loadingAction ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                Publish
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
