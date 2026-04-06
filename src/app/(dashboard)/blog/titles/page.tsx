'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Play,
  Plus,
  RefreshCcw,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { useTitlesApi } from '@/hooks/use-titles-api'
import { useGenerateTitlesMutation } from '@/hooks/queries/titles'
import type { BlogTitle } from '@/types/blog'

type SortKey = 'title_text' | 'status' | 'dateCreated'
type SortDir = 'asc' | 'desc'

const statusMap: Record<number, { text: string; variant: 'outline' | 'default' | 'success' | 'warning' | 'destructive' }> = {
  1: { text: 'Pending', variant: 'warning' },
  2: { text: 'Generated', variant: 'success' },
  3: { text: 'Approved', variant: 'default' },
  4: { text: 'Rejected', variant: 'destructive' },
  5: { text: 'Published', variant: 'success' },
}

const intervalMap: Record<string, number> = {
  daily: 1,
  every2days: 2,
  weekly: 7,
  biweekly: 14,
}

function formatDate(date: string | undefined, withTime = false) {
  if (!date) return '—'
  const d = new Date(date)
  const thisYear = new Date().getFullYear() === d.getFullYear()
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(thisYear ? {} : { year: 'numeric' }),
    ...(withTime ? ({ hour: 'numeric', minute: '2-digit' } as const) : {}),
  })
}

export default function BlogTitlesPage() {
  const {
    titlesData,
    categories,
    loading,
    fetchTitles,
    createTitle,
    updateTitle,
    deleteTitle,
    generatePost,
    regenerateTitle,
    schedulePost,
    scheduleByInterval,
    fetchCategories,
    assignCategory,
    createCategory,
    fetchNextPage: fetchMoreTitles,
    hasNextPage: hasMoreTitles,
    isFetchingNextPage: loadingMoreTitles,
  } = useTitlesApi()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<number | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [showGenForm, setShowGenForm] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [genTopic, setGenTopic] = useState('')
  const [genCount, setGenCount] = useState('5')
  const [newTitleText, setNewTitleText] = useState('')
  const [genLoading, setGenLoading] = useState(false)
  const generateTitlesMutation = useGenerateTitlesMutation()
  const [addingTitle, setAddingTitle] = useState(false)
  const [generatingTitleId, setGeneratingTitleId] = useState<number | null>(null)
  const [regeneratingTitleId, setRegeneratingTitleId] = useState<number | null>(null)
  const [deletingTitleId, setDeletingTitleId] = useState<number | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir } | null>({ key: 'dateCreated', dir: 'desc' })
  const [scheduleTitle, setScheduleTitle] = useState<BlogTitle | null>(null)
  const [scheduleDate, setScheduleDate] = useState('')
  const [savingSchedule, setSavingSchedule] = useState(false)
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [intervalType, setIntervalType] = useState('daily')
  const [intervalStartDate, setIntervalStartDate] = useState('')
  const [schedulingBulk, setSchedulingBulk] = useState(false)
  const [perPage, setPerPage] = useState(25)
  const [page, setPage] = useState(1)
  const [creatingCategoryFor, setCreatingCategoryFor] = useState<number | null>(null)

  useEffect(() => {
    fetchTitles()
    fetchCategories()
  }, [fetchTitles, fetchCategories])

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter, categoryFilter, sort, perPage])

  const filtered = useMemo(() => {
    let items = [...titlesData]

    if (statusFilter !== null) items = items.filter((t) => t.status === statusFilter)

    if (categoryFilter !== null) {
      items = items.filter((t) => t.categories?.some((c) => c.id === categoryFilter))
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter((t) => t.title_text.toLowerCase().includes(q))
    }

    if (sort) {
      items.sort((a, b) => {
        const factor = sort.dir === 'asc' ? 1 : -1
        if (sort.key === 'title_text') return a.title_text.localeCompare(b.title_text) * factor
        if (sort.key === 'status') return (a.status - b.status) * factor
        return (new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime()) * factor
      })
    }

    return items
  }, [titlesData, statusFilter, categoryFilter, search, sort])

  const paged = useMemo(() => {
    const start = (page - 1) * perPage
    return filtered.slice(start, start + perPage)
  }, [filtered, page, perPage])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))

  useEffect(() => {
    if (page >= totalPages && hasMoreTitles && !loadingMoreTitles) {
      void fetchMoreTitles()
    }
  }, [page, totalPages, hasMoreTitles, loadingMoreTitles, fetchMoreTitles])

  const hasScheduledColumn = titlesData.some((t) => !!t.scheduledDate)

  const pendingCount = titlesData.filter((t) => t.status === 1).length
  const generatedCount = titlesData.filter((t) => t.status === 2).length

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message) return error.message
    return fallback
  }

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (selected.size === paged.length && paged.length > 0) {
      setSelected(new Set())
      return
    }
    setSelected(new Set(paged.map((t) => t.id)))
  }

  const cycleSort = (key: SortKey) => {
    if (!sort || sort.key !== key) return setSort({ key, dir: 'asc' })
    if (sort.dir === 'asc') return setSort({ key, dir: 'desc' })
    return setSort(null)
  }

  const sortIndicator = (key: SortKey) => {
    if (!sort || sort.key !== key) return null
    return sort.dir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
  }

  const handleGenerateTitles = async () => {
    if (!genTopic.trim()) return
    setGenLoading(true)
    try {
      await generateTitlesMutation.mutateAsync({
        topic: genTopic,
        count: parseInt(genCount, 10) || 5,
      })
      setGenTopic('')
      setShowGenForm(false)
    } catch {
    } finally {
      setGenLoading(false)
    }
  }

  const handleAddTitle = async () => {
    if (!newTitleText.trim()) return
    setAddingTitle(true)
    try {
      const res = await createTitle(newTitleText.trim())
      if (!res.success) throw new Error(res.error)
      toast.success('Title created')
      setShowAddForm(false)
      setNewTitleText('')
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, 'Failed to create title'))
    } finally {
      setAddingTitle(false)
    }
  }

  const saveEdit = async () => {
    if (editingId === null) return
    setSavingEdit(true)
    try {
      const res = await updateTitle(editingId, { title_text: editText })
      if (!res.success) throw new Error(res.error)
      toast.success('Title updated')
      setEditingId(null)
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, 'Failed to update title'))
    } finally {
      setSavingEdit(false)
    }
  }

  const handleDelete = async (id: number) => {
    setDeletingTitleId(id)
    try {
      const res = await deleteTitle(id)
      if (!res.success) throw new Error(res.error)
      toast.success('Title deleted')
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, 'Failed to delete title'))
    } finally {
      setDeletingTitleId(null)
    }
  }

  const handleGenerate = async (id: number) => {
    setGeneratingTitleId(id)
    try {
      const res = await generatePost(id)
      if (!res.success) throw new Error(res.error)
      toast.success('Post generated')
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, 'Failed to generate post'))
    } finally {
      setGeneratingTitleId(null)
    }
  }

  const handleRegenerate = async (id: number) => {
    setRegeneratingTitleId(id)
    try {
      const res = await regenerateTitle(id)
      if (!res.success) throw new Error(res.error)
      toast.success('Title regenerated')
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, 'Failed to regenerate title'))
    } finally {
      setRegeneratingTitleId(null)
    }
  }

  const openSchedule = (title: BlogTitle) => {
    setScheduleTitle(title)
    setScheduleDate(title.scheduledDate ? new Date(title.scheduledDate).toISOString().slice(0, 16) : '')
  }

  const handleSaveSchedule = async () => {
    if (!scheduleTitle || !scheduleDate) return
    if (!scheduleTitle.postId) {
      toast.error('No generated post linked to this title yet.')
      return
    }
    setSavingSchedule(true)
    try {
      const res = await schedulePost(scheduleTitle.postId, scheduleDate)
      if (!res.success) throw new Error(res.error)
      toast.success('Post schedule updated')
      setScheduleTitle(null)
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, 'Failed to schedule post'))
    } finally {
      setSavingSchedule(false)
    }
  }

  const handleBulkDelete = async () => {
    setBulkDeleteOpen(false)
    const ids = Array.from(selected)
    if (!ids.length) return

    const toastId = toast.loading(`Deleting 0/${ids.length}...`)
    let count = 0
    try {
      for (const id of ids) {
        const res = await deleteTitle(id)
        if (!res.success) throw new Error(res.error)
        count += 1
        toast.loading(`Deleting ${count}/${ids.length}...`, { id: toastId })
      }
      toast.success(`Deleted ${count} title${count === 1 ? '' : 's'}`, { id: toastId })
      setSelected(new Set())
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, `Failed deleting titles (${count}/${ids.length})`), { id: toastId })
    }
  }

  const handleBulkStatus = async (status: 3 | 4) => {
    const ids = Array.from(selected)
    if (!ids.length) return

    const toastId = toast.loading(`Updating 0/${ids.length}...`)
    let count = 0
    try {
      for (const id of ids) {
        const res = await updateTitle(id, { status })
        if (!res.success) throw new Error(res.error)
        count += 1
        toast.loading(`Updating ${count}/${ids.length}...`, { id: toastId })
      }
      toast.success(`${status === 3 ? 'Approved' : 'Rejected'} ${count} title${count === 1 ? '' : 's'}`, { id: toastId })
      setSelected(new Set())
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, `Failed updating titles (${count}/${ids.length})`), { id: toastId })
    }
  }

  const handleBulkSchedule = async () => {
    const ids = Array.from(selected)
    if (!ids.length || !intervalStartDate) return
    setSchedulingBulk(true)
    try {
      const res = await scheduleByInterval(ids, intervalStartDate, intervalMap[intervalType])
      if (!res.success) throw new Error(res.error)
      toast.success(`Auto-assigned schedule to ${ids.length} title${ids.length === 1 ? '' : 's'}`)
      setScheduleDialogOpen(false)
      setSelected(new Set())
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, 'Failed to assign schedule'))
    } finally {
      setSchedulingBulk(false)
    }
  }

  const handleAssignCategory = async (titleId: number, categoryId: number | null) => {
    const res = await assignCategory(titleId, categoryId)
    if (!res.success) return toast.error(res.error || 'Failed to assign category')
    toast.success('Category updated')
  }

  const handleCreateCategory = async (titleId: number, name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const res = await createCategory(trimmed)
    if (!res.success) return toast.error(res.error || 'Failed to create category')
    if (res.categoryId) await handleAssignCategory(titleId, res.categoryId)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><p className="text-[11px] font-semibold tracking-[0.06em] text-muted-foreground">TOTAL TITLES</p><p className="text-[28px] font-semibold mt-1 leading-none">{loading ? '–' : titlesData.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-[11px] font-semibold tracking-[0.06em] text-muted-foreground">PENDING</p><p className="text-[28px] font-semibold mt-1 leading-none text-warning-foreground">{loading ? '–' : pendingCount}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-[11px] font-semibold tracking-[0.06em] text-muted-foreground">GENERATED</p><p className="text-[28px] font-semibold mt-1 leading-none text-success">{loading ? '–' : generatedCount}</p></CardContent></Card>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search titles..." className="h-8 pl-8" />
        </div>

        <div className="flex border border-border rounded-sm overflow-hidden text-[12px]">
          <Button size="sm" variant={statusFilter === null ? 'default' : 'ghost'} onClick={() => setStatusFilter(null)} className="h-7 rounded-none px-3">All</Button>
          <Button size="sm" variant={statusFilter === 1 ? 'default' : 'ghost'} onClick={() => setStatusFilter(1)} className="h-7 rounded-none border-l border-border px-3">Pending</Button>
          <Button size="sm" variant={statusFilter === 2 ? 'default' : 'ghost'} onClick={() => setStatusFilter(2)} className="h-7 rounded-none border-l border-border px-3">Generated</Button>
          <Button size="sm" variant={statusFilter === 3 ? 'default' : 'ghost'} onClick={() => setStatusFilter(3)} className="h-7 rounded-none border-l border-border px-3">Approved</Button>
          <Button size="sm" variant={statusFilter === 4 ? 'default' : 'ghost'} onClick={() => setStatusFilter(4)} className="h-7 rounded-none border-l border-border px-3">Rejected</Button>
        </div>

        <Select value={categoryFilter ? String(categoryFilter) : 'all'} onValueChange={(v) => setCategoryFilter(v === 'all' ? null : Number(v))}>
          <SelectTrigger className="h-8 w-[180px]"><SelectValue placeholder="Filter category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((category) => <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>)}
          </SelectContent>
        </Select>

        <div className="flex-1" />

        {selected.size > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleBulkStatus(3)}>Approve ({selected.size})</Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkStatus(4)}>Reject ({selected.size})</Button>
            <Button variant="outline" size="sm" onClick={() => setScheduleDialogOpen(true)}>Set Publishing Schedule</Button>
            <Button variant="outline" size="sm" className="text-destructive" onClick={() => setBulkDeleteOpen(true)}><Trash2 className="h-3 w-3 mr-1" /> Delete ({selected.size})</Button>
          </div>
        )}

        <Button variant="outline" size="sm" onClick={() => setShowAddForm((v) => !v)} className="gap-1.5"><Plus className="h-3 w-3" /> Add Title</Button>
        <Button variant="outline" size="sm" onClick={() => setShowGenForm((v) => !v)} className="gap-1.5"><Sparkles className="h-3 w-3" /> New Titles</Button>
      </div>

      {showAddForm && (
        <Card><CardContent className="p-4"><div className="flex gap-3 items-end"><div className="flex-1"><Label className="text-[13px] font-semibold mb-1 block">Title</Label><Input value={newTitleText} onChange={(e) => setNewTitleText(e.target.value)} className="h-9" /></div><Button onClick={handleAddTitle} disabled={addingTitle || !newTitleText.trim()}>{addingTitle ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Add'}</Button><Button variant="ghost" size="icon" onClick={() => setShowAddForm(false)}><X className="h-4 w-4" /></Button></div></CardContent></Card>
      )}

      {showGenForm && (
        <Card><CardContent className="p-4"><div className="flex gap-3 items-end"><div className="flex-1"><Label className="text-[13px] font-semibold mb-1 block">Topic</Label><Input value={genTopic} onChange={(e) => setGenTopic(e.target.value)} className="h-9" /></div><div className="w-24"><Label className="text-[13px] font-semibold mb-1 block">Count</Label><Input type="number" min="1" max="50" value={genCount} onChange={(e) => setGenCount(e.target.value)} className="h-9" /></div><Button onClick={handleGenerateTitles} disabled={genLoading || !genTopic.trim()}>{genLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Generate Titles'}</Button><Button variant="ghost" size="icon" onClick={() => setShowGenForm(false)}><X className="h-4 w-4" /></Button></div></CardContent></Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-secondary/50 text-[11px] font-semibold text-muted-foreground tracking-wide uppercase">
            <Checkbox checked={paged.length > 0 && selected.size === paged.length} onCheckedChange={selectAll} />
            <button className="flex-1 flex items-center gap-1" onClick={() => cycleSort('title_text')}>Title {sortIndicator('title_text')}</button>
            <button className="w-24 text-center flex items-center justify-center gap-1" onClick={() => cycleSort('status')}>Status {sortIndicator('status')}</button>
            <div className="w-44">Category</div>
            {hasScheduledColumn && <div className="w-36">Scheduled</div>}
            <button className="w-28 flex items-center gap-1" onClick={() => cycleSort('dateCreated')}>Created {sortIndicator('dateCreated')}</button>
            <div className="w-36">Actions</div>
          </div>

          {loading ? (
            <div className="p-4 space-y-3">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
          ) : paged.length === 0 ? (
            <div className="text-center py-16 text-[13px] text-muted-foreground">No titles match your filters.</div>
          ) : (
            paged.map((title) => {
              const status = statusMap[title.status] || statusMap[1]
              const isEditing = editingId === title.id
              const categoryName = title.categories?.[0]?.name || 'Uncategorized'
              const canSchedule = title.status >= 2

              return (
                <div key={title.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-border/60 last:border-0 hover:bg-muted group">
                  <Checkbox checked={selected.has(title.id)} onCheckedChange={() => toggleSelect(title.id)} />

                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex gap-1.5">
                        <Input value={editText} onChange={(e) => setEditText(e.target.value)} className="h-7" autoFocus onKeyDown={(e) => { if (e.key === 'Enter') void saveEdit(); if (e.key === 'Escape') setEditingId(null) }} />
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-success" onClick={saveEdit} disabled={savingEdit}>{savingEdit ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}</Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingId(null)}><X className="h-3.5 w-3.5" /></Button>
                      </div>
                    ) : title.status >= 2 ? (
                      <Link href={title.postId ? `/blog/${title.postId}` : `/blog?search=${encodeURIComponent(title.title_text)}`} className="text-[13px] truncate block hover:text-primary">
                        {title.title_text}
                      </Link>
                    ) : (
                      <span className="text-[13px] truncate block">{title.title_text}</span>
                    )}
                  </div>

                  <div className="w-24 text-center"><Badge variant={status.variant}>{status.text}</Badge></div>

                  <div className="w-44">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 text-[12px]">{categoryName}</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        {categories.map((category) => (
                          <DropdownMenuItem key={category.id} onClick={() => void handleAssignCategory(title.id, category.id)}>{category.name}</DropdownMenuItem>
                        ))}
                        <DropdownMenuItem onClick={() => void handleAssignCategory(title.id, null)}>Clear category</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setCreatingCategoryFor(title.id)}>+ New category</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {creatingCategoryFor === title.id && (
                      <Input
                        className="h-7 mt-1 text-[12px]"
                        placeholder="Type and press Enter"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            void handleCreateCategory(title.id, (e.currentTarget as HTMLInputElement).value)
                            setCreatingCategoryFor(null)
                          }
                          if (e.key === 'Escape') setCreatingCategoryFor(null)
                        }}
                      />
                    )}
                  </div>

                  {hasScheduledColumn && <div className="w-36 text-[12px] text-muted-foreground">{formatDate(title.scheduledDate, true)}</div>}

                  <div className="w-28 text-[12px] text-muted-foreground">
                    <div>{formatDate(title.dateCreated)}</div>
                    {title.generatedDate && <div className="text-[11px]">Gen: {formatDate(title.generatedDate)}</div>}
                  </div>

                  <div className="w-36 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingId(title.id); setEditText(title.title_text) }}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => void handleRegenerate(title.id)}>
                      {regeneratingTitleId === title.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCcw className="h-3 w-3" />}
                    </Button>
                    {title.status === 1 && (
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => void handleGenerate(title.id)}>
                        {generatingTitleId === title.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                      </Button>
                    )}
                    {canSchedule && (
                      <Popover>
                        <PopoverTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openSchedule(title)}><Calendar className="h-3 w-3" /></Button></PopoverTrigger>
                        <PopoverContent className="w-72 p-3" align="end">
                          <Label className="text-[12px]">Schedule date</Label>
                          <Input type="datetime-local" className="mt-1" value={scheduleTitle?.id === title.id ? scheduleDate : ''} onChange={(e) => setScheduleDate(e.target.value)} />
                          <Button size="sm" className="mt-2 w-full" onClick={handleSaveSchedule} disabled={savingSchedule || scheduleTitle?.id !== title.id || !scheduleDate}>{savingSchedule ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save schedule'}</Button>
                        </PopoverContent>
                      </Popover>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => void handleDelete(title.id)}>{deletingTitleId === title.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}</Button>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-[12px] text-muted-foreground">
          Showing {filtered.length ? (page - 1) * perPage + 1 : 0}-{Math.min(page * perPage, filtered.length)} of {filtered.length}
        </div>
        <div className="flex items-center gap-2">
          <Select value={String(perPage)} onValueChange={(v) => setPerPage(Number(v))}>
            <SelectTrigger className="h-8 w-[90px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="h-4 w-4" /></Button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = i + 1
            return <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" className="h-8 min-w-8" onClick={() => setPage(p)}>{p}</Button>
          })}
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Titles</DialogTitle>
            <DialogDescription>Are you sure you want to delete {selected.size} title{selected.size !== 1 ? 's' : ''}? This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleBulkDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Publishing Schedule</DialogTitle>
            <DialogDescription>Auto-assign schedule dates to selected titles.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-[12px]">Interval</Label>
              <Select value={intervalType} onValueChange={setIntervalType}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="every2days">Every 2 days</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Biweekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[12px]">Start date</Label>
              <Input type="datetime-local" className="mt-1" value={intervalStartDate} onChange={(e) => setIntervalStartDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleBulkSchedule} disabled={schedulingBulk || !intervalStartDate || selected.size === 0}>
              {schedulingBulk ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Auto-assign dates'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
