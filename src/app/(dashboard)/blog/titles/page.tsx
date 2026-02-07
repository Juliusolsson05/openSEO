'use client'

import { Label } from '@/components/ui/label'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Search,
  Sparkles,
  Trash2,
  Pencil,
  Check,
  X,
  Play,
  Plus,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useTitlesStore } from '@/stores/titles-store'
import { apiPost } from '@/lib/api'
import { useAction } from '@/hooks/use-action'

const statusMap: Record<number, { text: string; variant: 'outline' | 'default' | 'success' | 'warning' }> = {
  1: { text: 'Pending', variant: 'warning' },
  2: { text: 'Generated', variant: 'success' },
  3: { text: 'Scheduled', variant: 'default' },
  4: { text: 'Scheduled', variant: 'default' },
}

export default function BlogTitlesPage() {
  const { titlesData, loading, fetchTitles, updateTitle, deleteTitle, generatePost } = useTitlesStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<number | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [generatingAll, setGeneratingAll] = useState(false)
  const [bulkGenerating, setBulkGenerating] = useState(false)
  const [generatingTitleId, setGeneratingTitleId] = useState<number | null>(null)
  const [deletingTitleId, setDeletingTitleId] = useState<number | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const [showGenForm, setShowGenForm] = useState(false)
  const [genTopic, setGenTopic] = useState('')
  const [genCount, setGenCount] = useState('5')
  const [genLoading, setGenLoading] = useState(false)
  const { run: runGenerateAll } = useAction({
    successMessage: false,
    errorMessage: false,
  })

  useEffect(() => {
    fetchTitles()
  }, [fetchTitles])

  const filtered = useMemo(() => {
    let items = titlesData
    if (statusFilter !== null) items = items.filter((t) => t.status === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter((t) => t.title_text.toLowerCase().includes(q))
    }
    return items
  }, [titlesData, statusFilter, search])

  const pendingCount = titlesData.filter((t) => t.status === 1).length
  const generatedCount = titlesData.filter((t) => t.status === 2).length

  const getErrorMessage = (e: unknown, fallback: string) => {
    if (e instanceof Error && e.message) return e.message
    if (typeof e === 'string' && e.trim()) return e
    return fallback
  }

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map((t) => t.id)))
    }
  }

  const startEdit = (id: number, text: string) => {
    setEditingId(id)
    setEditText(text)
  }

  const saveEdit = async () => {
    if (editingId === null) return
    setSavingEdit(true)
    try {
      await updateTitle(editingId, { title_text: editText })
      toast.success('Title updated')
      setEditingId(null)
    } catch (e) {
      toast.error(getErrorMessage(e, 'Failed to update title'))
    } finally {
      setSavingEdit(false)
    }
  }

  const handleDelete = async (id: number) => {
    setDeletingTitleId(id)
    try {
      await deleteTitle(id)
      setSelected((prev) => {
        const n = new Set(prev)
        n.delete(id)
        return n
      })
      toast.success('Title deleted')
    } catch (e) {
      toast.error(getErrorMessage(e, 'Failed to delete title'))
    } finally {
      setDeletingTitleId(null)
    }
  }

  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  const handleBulkDelete = async () => {
    setBulkDeleteOpen(false)
    const total = selected.size
    if (total === 0) return

    const toastId = toast.loading(`Deleting 0/${total}...`)
    let completed = 0

    try {
      for (const id of selected) {
        await deleteTitle(id)
        completed += 1
        toast.loading(`Deleting ${completed}/${total}...`, { id: toastId })
      }
      setSelected(new Set())
      toast.success(`Deleted ${completed} title${completed === 1 ? '' : 's'}`, { id: toastId })
    } catch (e) {
      toast.error(getErrorMessage(e, `Failed deleting titles (${completed}/${total} complete)`), { id: toastId })
    }
  }

  const handleGenerate = async (id: number) => {
    setGeneratingTitleId(id)
    try {
      await generatePost(id)
      toast.success('Post generated')
    } catch (e) {
      toast.error(getErrorMessage(e, 'Failed to generate post'))
    } finally {
      setGeneratingTitleId(null)
    }
  }

  const handleBulkGenerate = async () => {
    const pendingSelected = Array.from(selected).filter((id) => {
      const title = titlesData.find((t) => t.id === id)
      return title?.status === 1
    })

    const total = pendingSelected.length
    if (total === 0) {
      toast.error('No pending titles selected')
      return
    }

    setBulkGenerating(true)
    const toastId = toast.loading(`Generating 0/${total}...`)
    let completed = 0

    try {
      for (const id of pendingSelected) {
        setGeneratingTitleId(id)
        await generatePost(id)
        completed += 1
        toast.loading(`Generating ${completed}/${total}...`, { id: toastId })
      }
      setSelected(new Set())
      toast.success(`Generated ${completed} post${completed === 1 ? '' : 's'}`, { id: toastId })
    } catch (e) {
      toast.error(getErrorMessage(e, `Failed generating posts (${completed}/${total} complete)`), { id: toastId })
    } finally {
      setGeneratingTitleId(null)
      setBulkGenerating(false)
    }
  }

  const handleGenerateAll = async () => {
    setGeneratingAll(true)
    const total = pendingCount
    const toastId = toast.loading(total > 0 ? `Generating posts... (0/${total})` : 'Generating posts...')

    try {
      const ok = await runGenerateAll(async () => {
        const { error } = await apiPost('/api/aurora/blog/posts/generate/', {})
        if (error) throw error
        await fetchTitles()
        return true
      })

      if (!ok) throw new Error('Failed to generate all posts')

      toast.success('Finished generating all pending posts', { id: toastId })
    } catch (e) {
      toast.error(getErrorMessage(e, 'Failed to generate all posts'), { id: toastId })
    } finally {
      setGeneratingAll(false)
    }
  }

  const handleGenerateTitles = async () => {
    if (!genTopic.trim()) return
    setGenLoading(true)

    try {
      const { error } = await apiPost('/api/aurora/blog/titles/generate/', {
        topic: genTopic,
        count: parseInt(genCount) || 5,
      })
      if (error) throw error

      await fetchTitles()
      toast.success(`Generated titles for "${genTopic}"`)
      setGenTopic('')
      setShowGenForm(false)
    } catch (e) {
      toast.error(getErrorMessage(e, 'Failed to generate titles'))
    } finally {
      setGenLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold tracking-[0.06em] text-muted-foreground">TOTAL TITLES</p>
            <p className="text-[28px] font-semibold mt-1 leading-none">{loading ? '–' : titlesData.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold tracking-[0.06em] text-muted-foreground">PENDING</p>
            <p className="text-[28px] font-semibold mt-1 leading-none text-warning-foreground">{loading ? '–' : pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold tracking-[0.06em] text-muted-foreground">GENERATED</p>
            <p className="text-[28px] font-semibold mt-1 leading-none text-success">{loading ? '–' : generatedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search titles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-full rounded-sm border border-border bg-white pl-8 pr-3 text-[13px] placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>

        {/* Status filter */}
        <div className="flex border border-border rounded-sm overflow-hidden text-[12px]">
          <Button
            size="sm"
            variant={statusFilter === null ? 'default' : 'ghost'}
            onClick={() => setStatusFilter(null)}
            className="h-7 rounded-none px-3"
          >All</Button>
          <Button
            size="sm"
            variant={statusFilter === 1 ? 'default' : 'ghost'}
            onClick={() => setStatusFilter(1)}
            className="h-7 rounded-none border-l border-border px-3"
          >Pending</Button>
          <Button
            size="sm"
            variant={statusFilter === 2 ? 'default' : 'ghost'}
            onClick={() => setStatusFilter(2)}
            className="h-7 rounded-none border-l border-border px-3"
          >Generated</Button>
          <Button
            size="sm"
            variant={statusFilter === 3 ? 'default' : 'ghost'}
            onClick={() => setStatusFilter(3)}
            className="h-7 rounded-none border-l border-border px-3"
          >Scheduled</Button>
        </div>

        <div className="flex-1" />

        {/* Bulk actions */}
        {selected.size > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-destructive" onClick={() => setBulkDeleteOpen(true)} disabled={bulkGenerating || generatingAll}>
              <Trash2 className="h-3 w-3" /> Delete ({selected.size})
            </Button>
            <Button size="sm" className="gap-1.5" onClick={handleBulkGenerate} disabled={bulkGenerating || generatingAll}>
              {bulkGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />} Generate ({selected.size})
            </Button>
          </div>
        )}

        {pendingCount > 0 && (
          <Button size="sm" className="gap-1.5" onClick={handleGenerateAll} disabled={generatingAll || bulkGenerating}>
            {generatingAll ? (
              <><Loader2 className="h-3 w-3 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="h-3.5 w-3.5" /> Generate All ({pendingCount})</>
            )}
          </Button>
        )}

        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowGenForm(!showGenForm)}>
          <Plus className="h-3 w-3" /> New Titles
        </Button>
      </div>

      {/* Generate form — collapsible */}
      {showGenForm && (
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Label className="text-[13px] font-semibold mb-1 block">Topic</Label>
                <Input
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  placeholder="e.g. AI tools for small businesses"
                  className="h-9"
                />
              </div>
              <div className="w-24">
                <Label className="text-[13px] font-semibold mb-1 block">Count</Label>
                <Input
                  type="number"
                  value={genCount}
                  onChange={(e) => setGenCount(e.target.value)}
                  min="1"
                  max="50"
                  className="h-9"
                />
              </div>
              <Button onClick={handleGenerateTitles} disabled={genLoading || !genTopic.trim()} className="gap-1.5">
                {genLoading ? (
                  <><Loader2 className="h-3 w-3 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="h-3.5 w-3.5" /> Generate Titles</>
                )}
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setShowGenForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Title table */}
      <Card>
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-secondary/50 text-[11px] font-semibold text-muted-foreground tracking-wide uppercase">
            <Checkbox
              checked={filtered.length > 0 && selected.size === filtered.length}
              onCheckedChange={selectAll}
              className="accent-primary"
            />
            <div className="flex-1">Title</div>
            <div className="w-24 text-center">Status</div>
            <div className="w-28">Created</div>
            <div className="w-28">Actions</div>
          </div>

          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[14px] font-semibold">{search || statusFilter !== null ? 'No titles match your filter' : 'No titles yet'}</p>
              <p className="text-[13px] text-muted-foreground mt-1">
                {search || statusFilter !== null ? 'Try different filters.' : 'Generate some titles to get started.'}
              </p>
              {!search && statusFilter === null && (
                <Button className="mt-4 gap-1.5" onClick={() => setShowGenForm(true)}>
                  <Plus className="h-3.5 w-3.5" /> Generate Titles
                </Button>
              )}
            </div>
          ) : (
            <div>
              {filtered.map((title) => {
                const status = statusMap[title.status] || statusMap[1]
                const isEditing = editingId === title.id
                const isGeneratingThisRow = generatingTitleId === title.id
                const isDeletingThisRow = deletingTitleId === title.id

                return (
                  <div key={title.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-border/60 last:border-0 hover:bg-muted group">
                    <Checkbox
                      checked={selected.has(title.id)}
                      onCheckedChange={() => toggleSelect(title.id)}
                      className="accent-primary"
                    />

                    {/* Title text or edit input */}
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex gap-1.5">
                          <Input
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="flex-1 h-7 rounded-sm border border-primary bg-white px-2 text-[13px] focus:outline-none"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit()
                              if (e.key === 'Escape') setEditingId(null)
                            }}
                          />
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-success" onClick={saveEdit} disabled={savingEdit}>
                            {savingEdit ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingId(null)} disabled={savingEdit}>
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[13px] truncate block">{title.title_text}</span>
                      )}
                    </div>

                    {/* Status */}
                    <div className="w-24 text-center">
                      <Badge variant={status.variant}>{status.text}</Badge>
                    </div>

                    {/* Date */}
                    <div className="w-28 text-[12px] text-muted-foreground">
                      {title.dateCreated
                        ? new Date(title.dateCreated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : '—'}
                    </div>

                    {/* Actions */}
                    <div className="w-28 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!isEditing && (
                        <>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(title.id, title.title_text)} title="Edit" disabled={isGeneratingThisRow || isDeletingThisRow || generatingAll || bulkGenerating}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          {title.status === 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-primary"
                              onClick={() => handleGenerate(title.id)}
                              title="Generate post"
                              disabled={isDeletingThisRow || generatingAll || bulkGenerating || isGeneratingThisRow}
                            >
                              {isGeneratingThisRow ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => handleDelete(title.id)}
                            title="Delete"
                            disabled={isGeneratingThisRow || isDeletingThisRow || generatingAll || bulkGenerating}
                          >
                            {isDeletingThisRow ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <DialogContent className="w-full max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Titles</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selected.size} title{selected.size !== 1 ? 's' : ''}? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleBulkDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
