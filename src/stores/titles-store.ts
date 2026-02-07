/**
 * Titles store — ported from aurora_dashboard/stores/blog/titlesStore.ts
 */

import { create } from 'zustand'
import { api, apiPost, apiPut, apiDelete } from '@/lib/api'
import type { BlogTitle } from './types'

interface TitlesState {
  titlesData: BlogTitle[]
  loading: boolean
  error: string | null

  fetchTitles: () => Promise<void>
  updateTitle: (titleId: number, data: Partial<BlogTitle>) => Promise<{ success: boolean; error?: string }>
  deleteTitle: (titleId: number) => Promise<{ success: boolean; error?: string }>
  regenerateTitle: (titleId: number) => Promise<{ success: boolean; error?: string }>
  schedulePost: (titleId: number, scheduledDate: string) => Promise<{ success: boolean; error?: string }>
  generatePost: (titleId: number) => Promise<{ success: boolean; error?: string }>
}

export const useTitlesStore = create<TitlesState>((set, get) => ({
  titlesData: [],
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

  updateTitle: async (titleId, updatedData) => {
    set({ loading: true, error: null })
    const { data, error } = await apiPut(`/api/aurora/blog/titles/update/${titleId}/`, updatedData)
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
    const { data, error } = await apiPost(`/api/aurora/blog/titles/regenerate/${titleId}/`, {})
    if (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
    await get().fetchTitles()
    set({ loading: false })
    return { success: true }
  },

  schedulePost: async (titleId, scheduledDate) => {
    set({ loading: true, error: null })
    const formattedDate = new Date(scheduledDate).toISOString().slice(0, 19) + 'Z'
    const { error } = await apiPost(`/api/aurora/blog/schedule/post/${titleId}/`, {
      scheduled_date: formattedDate,
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
    const { data, error } = await apiPost('/api/aurora/blog/posts/generate/', {
      title_id: titleId,
    })
    if (error) {
      set({ error: error.message })
      return { success: false, error: error.message }
    }
    await get().fetchTitles()
    return { success: true }
  },
}))
