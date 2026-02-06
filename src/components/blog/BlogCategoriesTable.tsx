'use client'

import { useEffect, useMemo, useState } from 'react'
import { api, apiDelete, apiPost, apiPut } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

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
      <div className="w-full max-w-md rounded-[4px] border border-[#E1E1E1] bg-white p-4 shadow-none">
        <h3 className="text-[13px] font-semibold text-[#1F1F1F]">{title}</h3>
        <div className="mt-3">
          <label className="mb-1 block text-[11px] uppercase tracking-[0.08em] text-[#616161]">Category name</label>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 rounded-[3px] border-[#E1E1E1] text-[13px]"
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading} className="h-8 rounded-[3px] text-[12px]">
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={loading || !value.trim()}
            className="h-8 rounded-[3px] bg-[#0078D4] text-[12px] hover:bg-[#106EBE]"
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
    <Card className="rounded-[4px] border-[#E1E1E1] bg-white shadow-none" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-[15px] font-semibold">Categories</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button onClick={runGenerate} disabled={actionLoading.generate} className="h-8 rounded-[3px] bg-[#0078D4] text-[12px] hover:bg-[#106EBE]">
              {actionLoading.generate ? 'Generating...' : categories.length ? 'Generate More' : 'Generate'}
            </Button>
            <Button onClick={runCategorize} disabled={actionLoading.categorize} className="h-8 rounded-[3px] bg-[#0078D4] text-[12px] hover:bg-[#106EBE]">
              {actionLoading.categorize ? 'Categorizing...' : 'Categorize'}
            </Button>
            <Button onClick={() => setAddOpen(true)} className="h-8 rounded-[3px] bg-[#0078D4] text-[12px] hover:bg-[#106EBE]">
              Add Category
            </Button>
            <Button
              variant="destructive"
              onClick={deleteSelected}
              disabled={selectedIds.length === 0 || actionLoading.deleteSelected}
              className="h-8 rounded-[3px] text-[12px]"
            >
              {actionLoading.deleteSelected ? 'Deleting...' : 'Delete Selected'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-9 w-full rounded-[3px]" />
            <Skeleton className="h-9 w-full rounded-[3px]" />
            <Skeleton className="h-9 w-full rounded-[3px]" />
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-[3px] border border-[#E1E1E1] bg-[#F2F2F2] p-3 text-[13px] text-[#555]">
            No categories found. Click <span className="font-semibold">Generate</span> to create categories.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[3px] border border-[#E1E1E1]">
            <table className="w-full border-collapse text-left text-[13px]">
              <thead className="bg-[#F2F2F2]">
                <tr>
                  <th className="w-10 border-b border-[#E1E1E1] px-3 py-2">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isIndeterminate
                      }}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="border-b border-[#E1E1E1] px-3 py-2 text-[11px] uppercase tracking-[0.08em] text-[#666]">Name</th>
                  <th className="border-b border-[#E1E1E1] px-3 py-2 text-[11px] uppercase tracking-[0.08em] text-[#666]">Post Count</th>
                  <th className="border-b border-[#E1E1E1] px-3 py-2 text-[11px] uppercase tracking-[0.08em] text-[#666]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="odd:bg-white even:bg-[#FCFCFC]">
                    <td className="border-b border-[#EDEDED] px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(category.id)}
                        onChange={() => toggleSelect(category.id)}
                      />
                    </td>
                    <td className="border-b border-[#EDEDED] px-3 py-2">{category.name}</td>
                    <td className="border-b border-[#EDEDED] px-3 py-2">
                      <Badge className="rounded-[3px] bg-[#F2F2F2] text-[#444] hover:bg-[#F2F2F2]">
                        {category.post_count}
                      </Badge>
                    </td>
                    <td className="border-b border-[#EDEDED] px-3 py-2">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="h-7 rounded-[3px] border-[#E1E1E1] px-2 text-[12px]"
                          onClick={() => openEdit(category)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          className="h-7 rounded-[3px] px-2 text-[12px]"
                          onClick={() => deleteOne(category.id)}
                          disabled={actionLoading.deleteOneId === category.id}
                        >
                          {actionLoading.deleteOneId === category.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
