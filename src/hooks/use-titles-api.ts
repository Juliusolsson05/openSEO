'use client'

/**
 * useTitlesApi — wraps React Query title mutations in the same interface
 * as the old useTitlesStore, so the existing titles page doesn't need rewriting.
 */

import { useCallback, useMemo } from 'react'
import {
  useTitlesQuery,
  useCategoriesQuery,
  useCreateTitleMutation,
  useUpdateTitleMutation,
  useDeleteTitleMutation,
  useRegenerateTitleMutation,
  useSchedulePostMutation,
  useScheduleByIntervalMutation,
  useGenerateTitlePostMutation,
  useAssignCategoryMutation,
  useCreateCategoryMutation,
} from '@/hooks/queries/titles'
import type { BlogTitle } from '@/types/blog'

export function useTitlesApi() {
  const { data: titlesPages, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useTitlesQuery()
  const titlesData = useMemo<BlogTitle[]>(
    () => titlesPages?.pages.flatMap((p) => p.data) ?? [],
    [titlesPages],
  )
  const { data: categories = [] } = useCategoriesQuery()

  const createTitleMutation = useCreateTitleMutation()
  const updateTitleMutation = useUpdateTitleMutation()
  const deleteTitleMutation = useDeleteTitleMutation()
  const regenerateTitleMutation = useRegenerateTitleMutation()
  const schedulePostMutation = useSchedulePostMutation()
  const scheduleByIntervalMutation = useScheduleByIntervalMutation()
  const generatePostMutation = useGenerateTitlePostMutation()
  const assignCategoryMutation = useAssignCategoryMutation()
  const createCategoryMutation = useCreateCategoryMutation()

  const wrap = useCallback(
    <T>(fn: () => Promise<T>): Promise<{ success: boolean; error?: string }> =>
      fn()
        .then(() => ({ success: true as const }))
        .catch((e: any) => ({
          success: false as const,
          error: e?.data?.detail || e?.message || 'Operation failed',
        })),
    []
  )

  const createTitle = useCallback(
    (titleText: string) => wrap(() => createTitleMutation.mutateAsync(titleText)),
    [createTitleMutation, wrap]
  )

  const updateTitle = useCallback(
    (
      titleId: number,
      data: Partial<BlogTitle> & { seo_title?: string | null; focus_keyword?: string | null }
    ) => wrap(() => updateTitleMutation.mutateAsync({ titleId, data })),
    [updateTitleMutation, wrap]
  )

  const deleteTitle = useCallback(
    (titleId: number) => wrap(() => deleteTitleMutation.mutateAsync(titleId)),
    [deleteTitleMutation, wrap]
  )

  const regenerateTitle = useCallback(
    (titleId: number) => wrap(() => regenerateTitleMutation.mutateAsync(titleId)),
    [regenerateTitleMutation, wrap]
  )

  const schedulePost = useCallback(
    (postId: number, scheduledDate: string) =>
      wrap(() => schedulePostMutation.mutateAsync({ postId, scheduledDate })),
    [schedulePostMutation, wrap]
  )

  const scheduleByInterval = useCallback(
    (titleIds: number[], startDate: string, intervalDays: number) =>
      wrap(() => scheduleByIntervalMutation.mutateAsync({ titleIds, startDate, intervalDays })),
    [scheduleByIntervalMutation, wrap]
  )

  const generatePost = useCallback(
    (titleId: number) => wrap(() => generatePostMutation.mutateAsync(titleId)),
    [generatePostMutation, wrap]
  )

  const assignCategory = useCallback(
    (titleId: number, categoryId: number | null) => {
      const title = titlesData.find((t) => t.id === titleId)
      return wrap(() =>
        assignCategoryMutation.mutateAsync({
          titleId,
          categoryId,
          titleText: title?.title_text ?? '',
        })
      )
    },
    [assignCategoryMutation, titlesData, wrap]
  )

  const createCategory = useCallback(
    async (name: string): Promise<{ success: boolean; error?: string; categoryId?: number }> => {
      try {
        const result = await createCategoryMutation.mutateAsync({ name })
        const newCat = result?.added_categories?.[0]
        return { success: true, categoryId: newCat?.id }
      } catch (e: any) {
        return {
          success: false,
          error: e?.data?.detail || e?.message || 'Failed to create category',
        }
      }
    },
    [createCategoryMutation]
  )

  return {
    titlesData,
    categories,
    loading: isLoading,
    createTitle,
    updateTitle,
    deleteTitle,
    regenerateTitle,
    schedulePost,
    scheduleByInterval,
    generatePost,
    fetchTitles: () => {}, // React Query auto-fetches; no-op for compatibility
    fetchCategories: () => {}, // same
    assignCategory,
    createCategory,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  }
}
