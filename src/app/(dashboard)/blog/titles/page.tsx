'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { apiPost } from '@/lib/api'
import { useTitlesStore } from '@/stores/titles-store'

interface BlogTitleRow {
  id: number
  title_text: string
  status: number
  created_at?: string
  dateCreated?: string
  scheduled_date?: string | null
  scheduledDate?: string | null
  generated_date?: string | null
  generatedDate?: string | null
}

const STATUS_OPTIONS = [
  { label: 'Pending', value: 1 },
  { label: 'Generated', value: 2 },
  { label: 'Scheduled', value: 3 },
]

function getStatusMeta(status: number) {
  if (status === 1) return { text: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200' }
  if (status === 2) return { text: 'Generated', className: 'bg-blue-50 text-blue-700 border-blue-200' }
  if (status === 3) return { text: 'Scheduled', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
  return { text: `Status ${status}`, className: 'bg-gray-50 text-gray-700 border-gray-200' }
}

function normalizeDate(row: BlogTitleRow) {
  return row.created_at ?? row.dateCreated ?? ''
}

function fmt(date?: string | null) {
  if (!date) return '—'
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function BlogTitlesPage() {
  const { titlesData, loading, error, fetchTitles, updateTitle, deleteTitle, generatePost } = useTitlesStore()

  const [step, setStep] = useState(0)
  const [topic, setTopic] = useState('')
  const [amount, setAmount] = useState(10)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | '1' | '2' | '3'>('all')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [notice, setNotice] = useState<{ text: string; tone: 'ok' | 'error' } | null>(null)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingText, setEditingText] = useState('')

  const refresh = useCallback(async () => {
    await fetchTitles()
  }, [fetchTitles])

  useEffect(() => {
    refresh()
  }, [refresh])

  const rows = useMemo(() => {
    const source = (titlesData ?? []) as unknown as BlogTitleRow[]
    return [...source].sort((a, b) => {
      const ad = new Date(normalizeDate(a)).getTime() || 0
      const bd = new Date(normalizeDate(b)).getTime() || 0
      return bd - ad
    })
  }, [titlesData])

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((r) => {
      const passStatus = statusFilter === 'all' ? true : String(r.status) === statusFilter
      const passSearch = q.length === 0 ? true : r.title_text?.toLowerCase().includes(q)
      return passStatus && passSearch
    })
  }, [rows, search, statusFilter])

  const pendingCount = rows.filter((r) => r.status === 1).length

  const setToast = (text: string, tone: 'ok' | 'error') => {
    setNotice({ text, tone })
    window.setTimeout(() => setNotice(null), 3000)
  }

  const onGenerateTitles = async () => {
    if (!topic.trim()) {
      setToast('Please enter a topic first.', 'error')
      return
    }
    setSubmitting(true)
    const { error: reqError } = await apiPost('/api/aurora/blog/titles/generate/', {
      business_type: topic.trim(),
      amount,
      keywords: [],
      language: 'English',
    })
    setSubmitting(false)
    if (reqError) {
      setToast(reqError.message || 'Failed to generate titles.', 'error')
      return
    }
    setToast('Titles generated successfully.', 'ok')
    await refresh()
    setStep(1)
  }

  const onGenerateBlogsAllPending = async () => {
    setBulkLoading(true)
    const { error: reqError } = await apiPost('/api/aurora/blog/posts/generate/', {})
    setBulkLoading(false)
    if (reqError) {
      setToast(reqError.message || 'Failed to generate blog posts.', 'error')
      return
    }
    setToast('Blog post generation started.', 'ok')
    await refresh()
  }

  const onBulkGenerateSelected = async () => {
    if (selectedIds.length === 0) return
    setBulkLoading(true)
    let failed = 0
    for (const id of selectedIds) {
      const result = await generatePost(id)
      if (!result.success) failed += 1
    }
    setBulkLoading(false)
    setSelectedIds([])
    await refresh()
    if (failed > 0) setToast(`Generated with ${failed} failed item(s).`, 'error')
    else setToast('Generated blog posts for selected titles.', 'ok')
  }

  const onBulkDeleteSelected = async () => {
    if (selectedIds.length === 0) return
    setBulkLoading(true)
    let failed = 0
    for (const id of selectedIds) {
      const res = await deleteTitle(id)
      if (!res.success) failed += 1
    }
    setBulkLoading(false)
    setSelectedIds([])
    await refresh()
    if (failed > 0) setToast(`Deleted with ${failed} failed item(s).`, 'error')
    else setToast('Selected titles deleted.', 'ok')
  }

  const onDeleteOne = async (id: number) => {
    const res = await deleteTitle(id)
    if (!res.success) setToast(res.error || 'Delete failed.', 'error')
    else {
      setToast('Title deleted.', 'ok')
      await refresh()
    }
  }

  const onSaveInlineEdit = async (id: number) => {
    if (!editingText.trim()) {
      setToast('Title cannot be empty.', 'error')
      return
    }
    const res = await updateTitle(id, { title_text: editingText.trim() } as any)
    if (!res.success) {
      setToast(res.error || 'Update failed.', 'error')
      return
    }
    setEditingId(null)
    setEditingText('')
    setToast('Title updated.', 'ok')
    await refresh()
  }

  const toggleSelected = (id: number, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)))
  }

  const allVisibleSelected = filteredRows.length > 0 && filteredRows.every((r) => selectedIds.includes(r.id))

  return (
    <div className="space-y-4" style={{ fontSize: 13 }}>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Blog Titles</h1>
        <div className="text-[11px] uppercase tracking-[0.08em] text-neutral-500">Azure-style workflow</div>
      </div>

      <Card className="border-[#E1E1E1] rounded-[4px] bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-[12px] uppercase tracking-[0.08em] text-neutral-600">Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {['Generate Titles', 'Manage Titles', 'Generate Blogs'].map((label, idx) => (
              <button
                key={label}
                type="button"
                onClick={() => setStep(idx)}
                className={`h-9 rounded-[3px] border px-3 text-left text-[13px] transition ${
                  step === idx
                    ? 'border-[#0078D4] bg-[#EAF4FD] text-[#0078D4]'
                    : 'border-[#E1E1E1] bg-[#F8F8F8] text-neutral-700 hover:bg-[#F2F2F2]'
                }`}
              >
                {idx + 1}. {label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {step === 0 && (
        <Card className="border-[#E1E1E1] rounded-[4px] bg-white">
          <CardHeader>
            <CardTitle className="text-[12px] uppercase tracking-[0.08em]">Generate Blog Titles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-[11px] uppercase tracking-[0.08em] text-neutral-600">Topic</label>
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. B2B SaaS automation" className="mt-1 rounded-[3px]" />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.08em] text-neutral-600">Count</label>
              <select
                className="mt-1 h-9 w-full rounded-[3px] border border-[#E1E1E1] bg-white px-2"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              >
                {[5, 10, 20, 30, 50, 75, 100, 150].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setStep(1)}>Skip to table</Button>
              <Button onClick={onGenerateTitles} disabled={submitting} style={{ backgroundColor: '#0078D4' }}>
                {submitting ? 'Generating...' : 'Generate Titles'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card className="border-[#E1E1E1] rounded-[4px] bg-white">
          <CardHeader>
            <CardTitle className="text-[12px] uppercase tracking-[0.08em]">Title Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col md:flex-row gap-2 md:items-center">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title..."
                className="rounded-[3px] md:max-w-sm"
              />
              <select
                className="h-9 rounded-[3px] border border-[#E1E1E1] bg-white px-2 md:w-44"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">All statuses</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={String(s.value)}>{s.label}</option>
                ))}
              </select>
              <div className="md:ml-auto flex gap-2">
                <Button variant="outline" disabled={bulkLoading || selectedIds.length === 0} onClick={onBulkGenerateSelected}>Generate Selected</Button>
                <Button variant="destructive" disabled={bulkLoading || selectedIds.length === 0} onClick={onBulkDeleteSelected}>Delete Selected</Button>
              </div>
            </div>

            <div className="overflow-x-auto border border-[#E1E1E1] rounded-[3px]">
              <table className="w-full min-w-[900px]">
                <thead className="bg-[#F2F2F2]">
                  <tr className="text-left">
                    <th className="p-2 w-9">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds(Array.from(new Set([...selectedIds, ...filteredRows.map((r) => r.id)])))
                          else setSelectedIds((prev) => prev.filter((id) => !filteredRows.some((r) => r.id === id)))
                        }}
                      />
                    </th>
                    <th className="p-2 text-[11px] uppercase tracking-[0.08em]">Title</th>
                    <th className="p-2 text-[11px] uppercase tracking-[0.08em]">Status</th>
                    <th className="p-2 text-[11px] uppercase tracking-[0.08em]">Date</th>
                    <th className="p-2 text-[11px] uppercase tracking-[0.08em]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(6)].map((_, i) => (
                      <tr key={i} className="border-t border-[#EDEDED]">
                        <td className="p-2"><Skeleton className="h-4 w-4" /></td>
                        <td className="p-2"><Skeleton className="h-4 w-[90%]" /></td>
                        <td className="p-2"><Skeleton className="h-4 w-16" /></td>
                        <td className="p-2"><Skeleton className="h-4 w-28" /></td>
                        <td className="p-2"><Skeleton className="h-4 w-44" /></td>
                      </tr>
                    ))
                  ) : filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-neutral-500">No titles found.</td>
                    </tr>
                  ) : (
                    filteredRows.map((row) => {
                      const meta = getStatusMeta(row.status)
                      return (
                        <tr key={row.id} className="border-t border-[#EDEDED] hover:bg-[#FAFAFA]">
                          <td className="p-2 align-top">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(row.id)}
                              onChange={(e) => toggleSelected(row.id, e.target.checked)}
                            />
                          </td>
                          <td className="p-2 align-top">
                            {editingId === row.id ? (
                              <div className="flex gap-2">
                                <Input value={editingText} onChange={(e) => setEditingText(e.target.value)} className="h-8 rounded-[3px]" />
                                <Button size="sm" onClick={() => onSaveInlineEdit(row.id)}>Save</Button>
                                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                              </div>
                            ) : (
                              <p>{row.title_text}</p>
                            )}
                          </td>
                          <td className="p-2 align-top">
                            <Badge className={`rounded-[3px] border ${meta.className}`}>{meta.text}</Badge>
                          </td>
                          <td className="p-2 align-top">{fmt(normalizeDate(row))}</td>
                          <td className="p-2 align-top">
                            <div className="flex flex-wrap gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingId(row.id)
                                  setEditingText(row.title_text)
                                }}
                              >
                                Edit
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => generatePost(row.id)}>Generate Post</Button>
                              <Button size="sm" variant="destructive" onClick={() => onDeleteOne(row.id)}>Delete</Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-[12px] text-neutral-600">{filteredRows.length} titles</p>
              <Button onClick={() => setStep(2)} style={{ backgroundColor: '#0078D4' }}>Continue</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="border-[#E1E1E1] rounded-[4px] bg-white">
          <CardHeader>
            <CardTitle className="text-[12px] uppercase tracking-[0.08em]">Blog Generation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-neutral-700">Pending titles: <strong>{pendingCount}</strong></p>
              <Button disabled={bulkLoading || pendingCount === 0} onClick={onGenerateBlogsAllPending} style={{ backgroundColor: '#0078D4' }}>
                {bulkLoading ? 'Generating...' : `Generate All (${pendingCount})`}
              </Button>
            </div>
            <div>
              <Button variant="outline" onClick={() => setStep(1)}>Back to table</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {error && <p className="text-[12px] text-red-600">{error}</p>}

      {notice && (
        <div className={`fixed bottom-4 right-4 rounded-[4px] border px-3 py-2 text-[12px] shadow-sm ${notice.tone === 'ok' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {notice.text}
        </div>
      )}
    </div>
  )
}
