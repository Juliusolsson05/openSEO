/**
 * Titles store — ported from aurora_dashboard/stores/blog/titlesStore.ts
 */

import { create } from 'zustand'
import { api, apiDelete, apiPost, apiPut } from '@/lib/api'
import type { BlogTitle, Category } from './types'

type StatusInput = BlogTitle['status'] | 'TO_BE_GENERATED' | 'GENERATED' | 'APPROVED' | 'REJECTED'
type UpdateTitleData = Partial<BlogTitle> & {
  seo_title?: string | null
  focus_keyword?: string | null
}

interface TitlesState {
  titlesData: BlogTitle[]
  categories: Category[]
  loading: boolean
  error: string | null

  fetchTitles: () => Promise<void>
  createTitle: (titleText: string) => Promise<{ success: boolean; error?: string }>
  updateTitle: (titleId: number, data: UpdateTitleData) => Promise<{ success: boolean; error?: string }>
  deleteTitle: (titleId: number) => Promise<{ success: boolean; error?: string }>
  regenerateTitle: (titleId: number) => Promise<{ success: boolean; error?: string }>
  schedulePost: (postId: number, scheduledDate: string) => Promise<{ success: boolean; error?: string }>
  scheduleByInterval: (titleIds: number[], startDate: string, intervalDays: number) => Promise<{ success: boolean; error?: string }>
  generatePost: (titleId: number) => Promise<{ success: boolean; error?: string }>
  fetchCategories: () => Promise<void>
  assignCategory: (titleId: number, categoryId: number | null) => Promise<{ success: boolean; error?: string }>
  createCategory: (name: string) => Promise<{ success: boolean; error?: string; categoryId?: number }>
}

const numberToStatus: Record<number, 'TO_BE_GENERATED' | 'GENERATED' | 'APPROVED' | 'REJECTED'> = {
  1: 'TO_BE_GENERATED',
  2: 'GENERATED',
  3: 'APPROVED',
  4: 'REJECTED',
}

function toStatus(value: StatusInput | undefined) {
  if (value === undefined || value === null) return undefined
  if (typeof value === 'number') return numberToStatus[value]
  return value
}

export const useTitlesStore = create<TitlesState>((set, get) => ({
  titlesData: [],
  categories: [],
  loading: false,
  error: null,

  fetchTitles: async () => {
    set({ loading: true, error: null })
    const { data, error } = await api<{ data: BlogTitle[]; total: number } | BlogTitle[]>('/api/aurora/blog/titles/')
    if (error) {
      set({ error: error.message, loading: false })
      return
    }
    const items = Array.isArray(data) ? data : (data?.data ?? [])
    set({ titlesData: items, loading: false })
  },

  createTitle: async (titleText) => {
    set({ error: null })
    const { error } = await apiPost('/api/aurora/blog/titles/create/', { title_text: titleText })
    if (error) {
      set({ error: error.message })
      return { success: false, error: error.message }
    }
    await get().fetchTitles()
    return { success: true }
  },

  updateTitle: async (titleId, updatedData) => {
    set({ loading: true, error: null })
    const payload: Record<string, unknown> = {
      title_text: updatedData.title_text,
      seo_title: updatedData.seo_title,
      focus_keyword: updatedData.focus_keyword,
    }

    const mappedStatus = toStatus(updatedData.status)
    if (mappedStatus) payload.status = mappedStatus

    const { error } = await apiPut(`/api/aurora/blog/titles/update/${titleId}/`, payload)
    if (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
    await get().fetchTitles()
    set({ loading: false })
    return { success: true }
  },

  deleteTitle: async (titleId) => {
    set({ loading: true, error: null })
    const { error } = await apiDelete(`/api/aurora/blog/titles/delete/${titleId}/`)
    if (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
    set((state) => ({
      titlesData: state.titlesData.filter((t) => t.id !== titleId),
      loading: false,
    }))
    return { success: true }
  },

  regenerateTitle: async (titleId) => {
    set({ loading: true, error: null })
    const { error } = await apiPost(`/api/aurora/blog/titles/regenerate/${titleId}/`, {})
    if (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
    await get().fetchTitles()
    set({ loading: false })
    return { success: true }
  },

  schedulePost: async (postId, scheduledDate) => {
    set({ loading: true, error: null })
    const { error } = await apiPost(`/api/aurora/blog/schedule/post/${postId}/`, {
      date: new Date(scheduledDate).toISOString(),
    })
    if (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
    await get().fetchTitles()
    set({ loading: false })
    return { success: true }
  },

  scheduleByInterval: async (titleIds, startDate, intervalDays) => {
    set({ loading: true, error: null })
    const { error } = await apiPost('/api/aurora/blog/schedule/interval/', {
      titleIds,
      startDate: new Date(startDate).toISOString(),
      intervalDays,
    })
    if (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
    await get().fetchTitles()
    set({ loading: false })
    return { success: true }
  },

  generatePost: async (titleId) => {
    set({ error: null })
    const { error } = await apiPost('/api/aurora/blog/posts/generate/', {
      title_id: titleId,
    })
    if (error) {
      set({ error: error.message })
      return { success: false, error: error.message }
    }
    await get().fetchTitles()
    return { success: true }
  },

  fetchCategories: async () => {
    const { data, error } = await api<Category[]>('/api/aurora/blog/categories/')
    if (error) {
      set({ error: error.message })
      return
    }
    set({ categories: Array.isArray(data) ? data : [] })
  },

  assignCategory: async (titleId, categoryId) => {
    const title = get().titlesData.find((item) => item.id === titleId)
    if (!title) return { success: false, error: 'Title not found' }

    const categoryIds = categoryId ? [categoryId] : []
    const { error } = await apiPut(`/api/aurora/blog/titles/update/${titleId}/`, {
      title_text: title.title_text,
      category_ids: categoryIds,
    })

    if (error) {
      set({ error: error.message })
      return { success: false, error: error.message }
    }

    await get().fetchTitles()
    return { success: true }
  },

  createCategory: async (name) => {
    const { data, error } = await apiPost<{ added_categories?: { id: number; name: string }[] }>(
      '/api/aurora/blog/categories/',
      { name },
    )
    if (error) {
      set({ error: error.message })
      return { success: false, error: error.message }
    }

    await get().fetchCategories()
    const categoryId = data?.added_categories?.[0]?.id
    return { success: true, categoryId }
  },
}))
