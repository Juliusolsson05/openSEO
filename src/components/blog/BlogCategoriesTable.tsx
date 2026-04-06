'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation, useBulkDeleteCategoriesMutation, useGenerateCategoriesMutation, useAutoCategorizesMutation } from '@/hooks/queries/titles'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sparkles,
  Tags,
  Plus,
  Pencil,
  Trash2,
  FolderTree,
  FileText,
} from 'lucide-react'

import type { Category as BaseCategory } from '@/types/blog'

interface Category extends BaseCategory {
  post_count: number
  title_count: number
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
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[13px]">{title}</DialogTitle>
        </DialogHeader>
        <div className="mt-3">
          <Label className="mb-1 block text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            Category name
          </Label>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && value.trim() && onSubmit()}
            className="h-8 rounded-sm border-border text-[13px]"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="h-8 rounded-sm text-[12px]"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={loading || !value.trim()}
            className="h-8 rounded-sm bg-primary text-[12px] hover:bg-primary-hover"
          >
            {loading ? 'Saving...' : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function BlogCategoriesTable() {
  const { data: rawCategories = [], isLoading: loading } = useCategoriesQuery()
  const categories = rawCategories as Category[]
  const generateCategoriesMutation = useGenerateCategoriesMutation()
  const autoCategorizeMutation = useAutoCategorizesMutation()
  const createCategoryMutation = useCreateCategoryMutation()
  const updateCategoryMutation = useUpdateCategoryMutation()
  const deleteCategoryMutation = useDeleteCategoryMutation()
  const bulkDeleteMutation = useBulkDeleteCategoriesMutation()
  const actionLoading = {
    generate: generateCategoriesMutation.isPending,
    categorize: autoCategorizeMutation.isPending,
    deleteSelected: bulkDeleteMutation.isPending,
    add: createCategoryMutation.isPending,
    edit: updateCategoryMutation.isPending,
    deleteOneId: deleteCategoryMutation.isPending
      ? deleteCategoryMutation.variables
      : undefined,
  } as const

  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editCategoryName, setEditCategoryName] = useState('')
  const [editCategoryId, setEditCategoryId] = useState<number | null>(null)



  const totalPostsInCategories = useMemo(
    () => categories.reduce((sum, c) => sum + (c.post_count ?? 0), 0),
    [categories],
  )

  const allSelected = useMemo(
    () => categories.length > 0 && selectedIds.length === categories.length,
    [selectedIds, categories],
  )

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : categories.map((c) => c.id))
  }

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    )
  }

  const runGenerate = async () => {
    try {
      await generateCategoriesMutation.mutateAsync()
    } catch {
    }
  }

  const runCategorize = async () => {
    try {
      await autoCategorizeMutation.mutateAsync()
    } catch {
    }
  }

  const addCategory = async () => {
    if (!newCategoryName.trim()) return
    try {
      await createCategoryMutation.mutateAsync({ name: newCategoryName.trim() })
      setNewCategoryName('')
      setAddOpen(false)
    } catch {
    }
  }

  const openEdit = (category: Category) => {
    setEditCategoryId(category.id)
    setEditCategoryName(category.name)
    setEditOpen(true)
  }

  const saveEdit = async () => {
    if (!editCategoryId || !editCategoryName.trim()) return
    try {
      await updateCategoryMutation.mutateAsync({ id: editCategoryId, name: editCategoryName.trim() })
      setEditOpen(false)
      setEditCategoryId(null)
      setEditCategoryName('')
    } catch {
    }
  }

  const deleteOne = async (id: number) => {
    try {
      await deleteCategoryMutation.mutateAsync(id)
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id))
    } catch {
    }
  }

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return
    try {
      await bulkDeleteMutation.mutateAsync(selectedIds)
      setSelectedIds([])
    } catch {
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-[15px] font-semibold">Categories</CardTitle>
            {!loading && (
              <Badge variant="outline" className="text-[11px] font-normal">
                {categories.length}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={runGenerate}
              disabled={actionLoading.generate}
              className="gap-1.5 text-[12px]"
            >
              <Sparkles className="h-3 w-3" />
              {actionLoading.generate ? 'Generating...' : 'Generate'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={runCategorize}
              disabled={actionLoading.categorize}
              className="gap-1.5 text-[12px]"
            >
              <FolderTree className="h-3 w-3" />
              {actionLoading.categorize ? 'Categorizing...' : 'Categorize'}
            </Button>
            <Button
              size="sm"
              onClick={() => setAddOpen(true)}
              className="gap-1.5 text-[12px]"
            >
              <Plus className="h-3 w-3" /> Add
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {loading ? (
          <div className="flex flex-wrap gap-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-28 rounded-sm" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center py-10">
            <Tags className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-[13px] font-semibold">No categories yet</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Generate categories or add one manually.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleSelectAll}
                />
                <span>Select all</span>
              </label>
              {selectedIds.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={deleteSelected}
                  disabled={actionLoading.deleteSelected}
                  className="h-6 gap-1 text-destructive hover:text-destructive px-2 text-[11px]"
                >
                  <Trash2 className="h-3 w-3" />
                  {actionLoading.deleteSelected
                    ? 'Deleting...'
                    : `Delete ${selectedIds.length}`}
                </Button>
              )}
              <span className="ml-auto">
                {totalPostsInCategories} post assignments across{' '}
                {categories.length} categories
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const selected = selectedIds.includes(cat.id)
                return (
                  <div
                    key={cat.id}
                    className={`group flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 text-[13px] transition-colors ${
                      selected
                        ? 'border-primary/40 bg-primary/5'
                        : 'border-border bg-white hover:border-primary/30'
                    }`}
                  >
                    <Checkbox
                      checked={selected}
                      onCheckedChange={() => toggleSelect(cat.id)}
                      className="h-3.5 w-3.5"
                    />
                    <span className="font-medium">{cat.name}</span>
                    <Badge
                      variant="secondary"
                      className="ml-0.5 h-5 min-w-[20px] justify-center rounded-full px-1.5 text-[10px] font-semibold"
                    >
                      {cat.post_count}
                    </Badge>
                    <div className="ml-0.5 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(cat)}
                        className="rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => deleteOne(cat.id)}
                        disabled={actionLoading.deleteOneId === cat.id}
                        className="rounded p-0.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
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
