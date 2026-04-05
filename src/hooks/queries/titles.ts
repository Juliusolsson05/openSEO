'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, apiPost, apiPut, apiDelete } from '@/lib/api'
import { QK } from '@/lib/query-keys'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/get-error-message'
import type { BlogTitle, Category } from '@/types/blog'

// ─── Number → Status mapping (same as titlesApi) ────────────────────────────

type StatusInput = BlogTitle['status'] | 'TO_BE_GENERATED' | 'GENERATED' | 'APPROVED' | 'REJECTED' | 'PUBLISHED'

const numberToStatus: Record<number, 'TO_BE_GENERATED' | 'GENERATED' | 'APPROVED' | 'REJECTED' | 'PUBLISHED'> = {
  1: 'TO_BE_GENERATED',
  2: 'GENERATED',
  3: 'APPROVED',
  4: 'REJECTED',
  5: 'PUBLISHED',
}

function toStatus(value: StatusInput | undefined) {
  if (value === undefined || value === null) return undefined
  if (typeof value === 'number') return numberToStatus[value]
  return value
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useTitlesQuery() {
  return useQuery({
    queryKey: QK.titles(),
    queryFn: async () => {
      const data = await api<{ data: BlogTitle[]; total: number }>(
        '/api/aurora/blog/titles/',
      )
      return data?.data ?? []
    },
  })
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: QK.categories(),
    queryFn: async () => {
      const data = await api<Category[] | unknown>(
        '/api/aurora/blog/categories/',
      )
      return Array.isArray(data) ? (data as Category[]) : []
    },
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateTitleMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (titleText: string) =>
      apiPost('/api/aurora/blog/titles/create/', { title_text: titleText }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.titles() })
      toast.success('Title created')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to create title'))
    },
  })
}

export function useUpdateTitleMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      titleId,
      data: titleData,
    }: {
      titleId: number
      data: Partial<BlogTitle> & { seo_title?: string | null; focus_keyword?: string | null }
    }) => {
      const payload: Record<string, unknown> = {
        title_text: titleData.title_text,
        seo_title: titleData.seo_title,
        focus_keyword: titleData.focus_keyword,
      }
      const mappedStatus = toStatus(titleData.status)
      if (mappedStatus) payload.status = mappedStatus

      return apiPut(`/api/aurora/blog/titles/update/${titleId}/`, payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.titles() })
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to update title'))
    },
  })
}

export function useDeleteTitleMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (titleId: number) =>
      apiDelete(`/api/aurora/blog/titles/delete/${titleId}/`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.titles() })
      toast.success('Title deleted')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to delete title'))
    },
  })
}

export function useRegenerateTitleMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (titleId: number) =>
      apiPost(`/api/aurora/blog/titles/regenerate/${titleId}/`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.titles() })
      toast.success('Title regenerated')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to regenerate title'))
    },
  })
}

export function useSchedulePostMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      postId,
      scheduledDate,
    }: {
      postId: number
      scheduledDate: string
    }) =>
      apiPost(`/api/aurora/blog/schedule/post/${postId}/`, {
        date: new Date(scheduledDate).toISOString(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.titles() })
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to schedule post'))
    },
  })
}

export function useScheduleByIntervalMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      titleIds,
      startDate,
      intervalDays,
    }: {
      titleIds: number[]
      startDate: string
      intervalDays: number
    }) =>
      apiPost('/api/aurora/blog/schedule/interval/', {
        titleIds,
        startDate: new Date(startDate).toISOString(),
        intervalDays,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.titles() })
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to schedule by interval'))
    },
  })
}

export function useGenerateTitlePostMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (titleId: number) =>
      apiPost('/api/aurora/blog/posts/generate/', { title_id: titleId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.titles() })
      toast.success('Post generation started')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to generate post'))
    },
  })
}

export function useAssignCategoryMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      titleId,
      categoryId,
      titleText,
    }: {
      titleId: number
      categoryId: number | null
      titleText: string
    }) =>
      apiPut(`/api/aurora/blog/titles/update/${titleId}/`, {
        title_text: titleText,
        category_ids: categoryId ? [categoryId] : [],
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.titles() })
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to assign category'))
    },
  })
}

export function useCreateCategoryMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ name }: { name: string }) =>
      apiPost<{
        added_categories?: { id: number; name: string }[]
      }>('/api/aurora/blog/categories/', { name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.categories() })
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to create category'))
    },
  })
}

export function useGenerateTitlesMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ topic, count }: { topic: string; count: number }) =>
      apiPost('/api/aurora/blog/titles/generate/', { topic, count }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.titles() })
      toast.success('Titles generated')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to generate titles'))
    },
  })
}

export function useUpdateCategoryMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      apiPut(`/api/aurora/blog/categories/${id}/`, { name }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: QK.categories() }) },
    onError: (err) => { toast.error(getErrorMessage(err, 'Failed to update category')) },
  })
}

export function useDeleteCategoryMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      apiDelete(`/api/aurora/blog/categories/${id}/`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.categories() })
      toast.success('Category deleted')
    },
    onError: (err) => { toast.error(getErrorMessage(err, 'Failed to delete category')) },
  })
}

export function useBulkDeleteCategoriesMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids: number[]) =>
      apiPost('/api/aurora/blog/categories/bulk-delete/', { ids }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.categories() })
      toast.success('Categories deleted')
    },
    onError: (err) => { toast.error(getErrorMessage(err, 'Failed to delete categories')) },
  })
}

export function useGenerateCategoriesMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      apiPost('/api/aurora/blog/categories/generate/', {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.categories() })
      toast.success('Categories generated')
    },
    onError: (err) => { toast.error(getErrorMessage(err, 'Failed to generate categories')) },
  })
}

export function useAutoCategorizesMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      apiPost('/api/aurora/blog/categories/categorize/', {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.categories() })
      qc.invalidateQueries({ queryKey: QK.titles() })
      toast.success('Auto-categorize completed')
    },
    onError: (err) => { toast.error(getErrorMessage(err, 'Failed to auto-categorize')) },
  })
}

export function useReschedulePostMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ postId, date }: { postId: number | string; date: string }) =>
      apiPut(`/api/aurora/blog/schedule/reschedule/${postId}/`, { date }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: QK.titles() }) },
    onError: (err) => { toast.error(getErrorMessage(err, 'Failed to reschedule')) },
  })
}

export function useBulkCreateScheduleMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: object) =>
      apiPost<{ id: number }>('/api/aurora/blog/schedule/bulk/create/', payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: QK.titles() }) },
    onError: (err) => { toast.error(getErrorMessage(err, 'Failed to create schedule')) },
  })
}

export function useBulkAssignScheduleMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: object) =>
      apiPost('/api/aurora/blog/schedule/bulk/assign/', payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: QK.titles() }) },
    onError: (err) => { toast.error(getErrorMessage(err, 'Failed to assign schedule')) },
  })
}
