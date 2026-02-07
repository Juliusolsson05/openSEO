'use client'

import { useEffect, useMemo, useState } from 'react'
import { api, apiDelete, apiPost, apiPut } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

interface Category {
  id: number
  name: string
  post_count: number
}

interface CategoryFormModalProps {
  open: boolean
  title: string
  value: string
  submitLabel: string
  loading: boolean
  onClose: () => void
  onChange: (value: string) => void
  onSubmit: () => void
}

function CategoryFormModal({
  open,
  title,
  value,
  submitLabel,
  loading,
  onClose,
  onChange,
  onSubmit,
}: CategoryFormModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded border border-border bg-white p-4 shadow-none">
        <h3 className="text-[13px] font-semibold text-foreground">{title}</h3>
        <div className="mt-3">
          <Label className="mb-1 block text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Category name</Label>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 rounded-sm border-border text-[13px]"
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading} className="h-8 rounded-sm text-[12px]">
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={loading || !value.trim()}
            className="h-8 rounded-sm bg-primary text-[12px] hover:bg-primary-hover"
          >
            {loading ? 'Saving...' : submitLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function BlogCategoriesTable() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState({
    generate: false,
    categorize: false,
    deleteSelected: false,
    add: false,
    edit: false,
    deleteOneId: 0,
  })

  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editCategoryName, setEditCategoryName] = useState('')
  const [editCategoryId, setEditCategoryId] = useState<number | null>(null)

  const fetchCategories = async () => {
    setLoading(true)
    const { data, error } = await api<Category[]>('/api/aurora/blog/categories/')
    if (!error && data) {
      setCategories(data)
      setSelectedIds((prev) => prev.filter((id) => data.some((c) => c.id === id)))
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const allSelected = useMemo(
    () => categories.length > 0 && selectedIds.length === categories.length,
    [selectedIds, categories]
  )

  const isIndeterminate = useMemo(
    () => selectedIds.length > 0 && selectedIds.length < categories.length,
    [selectedIds, categories]
  )

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(categories.map((c) => c.id))
    }
  }

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    )
  }

  const runGenerate = async () => {
    setActionLoading((v) => ({ ...v, generate: true }))
    await apiPost('/api/aurora/blog/categories/generate/', {})
    await fetchCategories()
    setActionLoading((v) => ({ ...v, generate: false }))
  }

  const runCategorize = async () => {
    setActionLoading((v) => ({ ...v, categorize: true }))
    await apiPost('/api/aurora/blog/categories/categorize/', {})
    await fetchCategories()
    setActionLoading((v) => ({ ...v, categorize: false }))
  }

  const addCategory = async () => {
    if (!newCategoryName.trim()) return
    setActionLoading((v) => ({ ...v, add: true }))
    await apiPost('/api/aurora/blog/categories/', { name: newCategoryName.trim() })
    setNewCategoryName('')
    setAddOpen(false)
    await fetchCategories()
    setActionLoading((v) => ({ ...v, add: false }))
  }

  const openEdit = (category: Category) => {
    setEditCategoryId(category.id)
    setEditCategoryName(category.name)
    setEditOpen(true)
  }

  const saveEdit = async () => {
    if (!editCategoryId || !editCategoryName.trim()) return
    setActionLoading((v) => ({ ...v, edit: true }))
    await apiPut(`/api/aurora/blog/categories/${editCategoryId}/`, {
      name: editCategoryName.trim(),
    })
    setEditOpen(false)
    setEditCategoryId(null)
    setEditCategoryName('')
    await fetchCategories()
    setActionLoading((v) => ({ ...v, edit: false }))
  }

  const deleteOne = async (id: number) => {
    setActionLoading((v) => ({ ...v, deleteOneId: id }))
    await apiDelete(`/api/aurora/blog/categories/${id}/`)
    await fetchCategories()
    setActionLoading((v) => ({ ...v, deleteOneId: 0 }))
  }

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return
    setActionLoading((v) => ({ ...v, deleteSelected: true }))
    await apiPost('/api/aurora/blog/categories/bulk-delete/', {
      category_ids: selectedIds,
    })
    setSelectedIds([])
    await fetchCategories()
    setActionLoading((v) => ({ ...v, deleteSelected: false }))
  }

  return (
    <Card className="rounded border-border bg-white shadow-none" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-[15px] font-semibold">Categories</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button onClick={runGenerate} disabled={actionLoading.generate} className="h-8 rounded-sm bg-primary text-[12px] hover:bg-primary-hover">
              {actionLoading.generate ? 'Generating...' : categories.length ? 'Generate More' : 'Generate'}
            </Button>
            <Button onClick={runCategorize} disabled={actionLoading.categorize} className="h-8 rounded-sm bg-primary text-[12px] hover:bg-primary-hover">
              {actionLoading.categorize ? 'Categorizing...' : 'Categorize'}
            </Button>
            <Button onClick={() => setAddOpen(true)} className="h-8 rounded-sm bg-primary text-[12px] hover:bg-primary-hover">
              Add Category
            </Button>
            <Button
              variant="destructive"
              onClick={deleteSelected}
              disabled={selectedIds.length === 0 || actionLoading.deleteSelected}
              className="h-8 rounded-sm text-[12px]"
            >
              {actionLoading.deleteSelected ? 'Deleting...' : 'Delete Selected'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-9 w-full rounded-sm" />
            <Skeleton className="h-9 w-full rounded-sm" />
            <Skeleton className="h-9 w-full rounded-sm" />
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-sm border border-border bg-background p-3 text-[13px] text-muted-foreground">
            No categories found. Click <span className="font-semibold">Generate</span> to create categories.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-sm border border-border">
            <Table className="w-full border-collapse text-left text-[13px]">
              <TableHeader className="bg-background">
                <TableRow>
                  <TableHead className="w-10 border-b border-border px-3 py-2">
                    <Checkbox
                      checked={allSelected ? true : isIndeterminate ? "indeterminate" : false}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="border-b border-border px-3 py-2 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Name</TableHead>
                  <TableHead className="border-b border-border px-3 py-2 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Post Count</TableHead>
                  <TableHead className="border-b border-border px-3 py-2 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id} className="odd:bg-white even:bg-background">
                    <TableCell className="border-b border-border px-3 py-2">
                      <Checkbox
                        checked={selectedIds.includes(category.id)}
                        onCheckedChange={() => toggleSelect(category.id)}
                      />
                    </TableCell>
                    <TableCell className="border-b border-border px-3 py-2">{category.name}</TableCell>
                    <TableCell className="border-b border-border px-3 py-2">
                      <Badge className="rounded-sm bg-background text-muted-foreground hover:bg-background">
                        {category.post_count}
                      </Badge>
                    </TableCell>
                    <TableCell className="border-b border-border px-3 py-2">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="h-7 rounded-sm border-border px-2 text-[12px]"
                          onClick={() => openEdit(category)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          className="h-7 rounded-sm px-2 text-[12px]"
                          onClick={() => deleteOne(category.id)}
                          disabled={actionLoading.deleteOneId === category.id}
                        >
                          {actionLoading.deleteOneId === category.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <CategoryFormModal
        open={addOpen}
        title="Add Category"
        value={newCategoryName}
        submitLabel="Add"
        loading={actionLoading.add}
        onClose={() => {
          setAddOpen(false)
          setNewCategoryName('')
        }}
        onChange={setNewCategoryName}
        onSubmit={addCategory}
      />

      <CategoryFormModal
        open={editOpen}
        title="Edit Category"
        value={editCategoryName}
        submitLabel="Save"
        loading={actionLoading.edit}
        onClose={() => {
          setEditOpen(false)
          setEditCategoryId(null)
          setEditCategoryName('')
        }}
        onChange={setEditCategoryName}
        onSubmit={saveEdit}
      />
    </Card>
  )
}
