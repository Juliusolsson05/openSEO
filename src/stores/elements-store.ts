/**
 * Elements store — ported from aurora_dashboard/stores/elements/elementsStore.ts
 */

import { create } from 'zustand'
import { api, apiPost, apiPut, apiDelete, apiPostForm } from '@/lib/api'

import type { CTA } from '@/types/blog'

interface ElementsState {
  ctaList: CTA[]
  loading: boolean
  error: Error | null
  fetchPromise: Promise<CTA[]> | null

  fetchCTAList: () => Promise<CTA[]>
  updateElement: (
    elementId: number,
    content: any,
    blogPostId: number
  ) => Promise<{ success: boolean; error?: string }>
  deleteElement: (
    blogPostId: number,
    elementId: number
  ) => Promise<{ success: boolean; error?: string }>
  regenerateElement: (payload: {
    blog_post_id: number
    blog_element_id: number
    regeneration_note: string
    new_element_type?: string
    new_element_count?: number
  }) => Promise<{ success: boolean; error?: string }>
  enhanceElement: (
    blogPostId: number,
    elementId: number
  ) => Promise<{ success: boolean; error?: string }>
  humanizeElement: (
    blogPostId: number,
    elementId: number
  ) => Promise<{ success: boolean; error?: string }>
  addElement: (payload: {
    blog_post_id: number
    element_id: number
    element_type?: string
    generation_note?: string
    cta_id?: number
  }) => Promise<{ success: boolean; error?: string }>
  clearStore: () => void
  clearError: () => void
}

export const useElementsStore = create<ElementsState>((set, get) => ({
  ctaList: [],
  loading: false,
  error: null,
  fetchPromise: null,

  fetchCTAList: async () => {
    const { ctaList, fetchPromise } = get()

    // Return cached data
    if (ctaList.length > 0) return ctaList

    // Return ongoing fetch
    if (fetchPromise) return fetchPromise

    set({ loading: true, error: null })

    const promise = (async () => {
      try {
        const { data, error } = await api<any[]>('/api/aurora/blog/cta/list/')
        if (error) throw error
        if (!data) throw new Error('Invalid data format')

        const ctas: CTA[] = data.flatMap((campaign: any) =>
          campaign.ctas.map((cta: any) => ({
            id: cta.id,
            title: cta.title,
            description: cta.description,
            image_url: cta.image_url,
          }))
        )

        set({ ctaList: ctas, loading: false, fetchPromise: null })
        return ctas
      } catch (e) {
        console.error('[ElementsStore] Error fetching CTAs:', e)
        set({ error: e as Error, loading: false, fetchPromise: null })
        throw e
      }
    })()

    set({ fetchPromise: promise })
    return promise
  },

  updateElement: async (elementId, content, blogPostId) => {
    const { error } = await apiPut(
      `/api/aurora/blog/posts/update-element/${elementId}/`,
      { content, blog_post: blogPostId }
    )
    if (error) {
      console.error('[ElementsStore] Error updating element:', error)
      return { success: false, error: error.message }
    }
    return { success: true }
  },

  deleteElement: async (blogPostId, elementId) => {
    const { error } = await apiDelete('/api/aurora/blog/posts/delete-element/', {
      params: {
        blog_post_id: blogPostId,
        element_id: elementId,
      },
    })
    if (error) {
      console.error('[ElementsStore] Error deleting element:', error)
      return { success: false, error: error.message }
    }
    return { success: true }
  },

  regenerateElement: async (payload) => {
    const { error } = await apiPost(
      '/api/aurora/blog/posts/elements/regenerate/',
      payload
    )
    if (error) {
      console.error('[ElementsStore] Error regenerating element:', error)
      return { success: false, error: error.message }
    }
    return { success: true }
  },

  enhanceElement: async (blogPostId, elementId) => {
    const { error } = await apiPost('/api/aurora/blog/posts/elements/enhance/', {
      blog_post_id: blogPostId,
      blog_element_id: elementId,
    })
    if (error) {
      console.error('[ElementsStore] Error enhancing element:', error)
      return { success: false, error: error.message }
    }
    return { success: true }
  },

  humanizeElement: async (blogPostId, elementId) => {
    const { error } = await apiPost('/api/aurora/blog/posts/elements/humanize/', {
      blog_post_id: blogPostId,
      blog_element_id: elementId,
    })
    if (error) {
      console.error('[ElementsStore] Error humanizing element:', error)
      return { success: false, error: error.message }
    }
    return { success: true }
  },

  addElement: async (payload) => {
    const endpoint = payload.cta_id
      ? '/api/aurora/blog/cta/add-cta/'
      : '/api/aurora/blog/posts/elements/add/'

    const { error } = await apiPost(endpoint, payload)
    if (error) {
      console.error('[ElementsStore] Error adding element:', error)
      return { success: false, error: error.message }
    }
    return { success: true }
  },

  clearStore: () =>
    set({ ctaList: [], loading: false, error: null, fetchPromise: null }),

  clearError: () => set({ error: null }),
}))
