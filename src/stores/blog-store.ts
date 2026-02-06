/**
 * Blog store — ported from aurora_dashboard/stores/blog/blogStore.ts
 */

import { create } from 'zustand'
import { api } from '@/lib/api'
import type { BlogPost, BlogPostElement, AutopilotOperation } from './types'

interface BlogState {
  post: BlogPost | null
  loading: boolean
  error: Error | null

  fetchPost: (postId: number | string, silent?: boolean) => Promise<void>
  insertSkeletonLoader: (operationId: number, operation: AutopilotOperation) => void
  removeSkeletonLoaders: () => void
  removeSkeletonLoaderByOperationId: (operationId: number) => void
  reset: () => void
}

export const useBlogStore = create<BlogState>((set, get) => ({
  post: null,
  loading: false,
  error: null,

  fetchPost: async (postId, silent = false) => {
    if (!silent) set({ loading: true })
    set({ error: null })

    const { data, error } = await api(`/api/aurora/blog/posts?post_id=${postId}`)

    if (error) {
      console.error('[BlogStore] Error fetching post data:', error)
      set({ error, loading: false })
      return
    }

    if (data && typeof data === 'object') {
      set({ post: data as BlogPost })
    } else {
      set({ error: new Error('Unexpected data format') })
    }

    if (!silent) set({ loading: false })
  },

  insertSkeletonLoader: (operationId, operation) => {
    const { post } = get()
    if (!post) return

    const skeletonElement: BlogPostElement = {
      id: -operationId,
      element_type: operation.elementType || 'paragraph',
      content: {},
      hyperlink: null,
      created_at: new Date().toISOString(),
      blog_post: post.id,
      isLoading: true,
    }

    const elements = [...post.elements]

    if (operation.type === 'new' && operation.position) {
      const index = elements.findIndex(
        (el) => el.id === operation.position!.afterElementId
      )
      if (index !== -1) {
        elements.splice(index + 1, 0, skeletonElement)
      } else {
        elements.push(skeletonElement)
      }
    } else {
      const index = elements.findIndex((el) => el.id === operation.elementId)
      if (index !== -1) {
        skeletonElement.element_type = elements[index].element_type
        elements[index] = skeletonElement
      }
    }

    set({ post: { ...post, elements } })
  },

  removeSkeletonLoaders: () => {
    const { post } = get()
    if (!post) return
    set({
      post: {
        ...post,
        elements: post.elements.filter((el) => !el.isLoading),
      },
    })
  },

  removeSkeletonLoaderByOperationId: (operationId) => {
    const { post } = get()
    if (!post) return
    set({
      post: {
        ...post,
        elements: post.elements.filter((el) => el.id !== -operationId && el.id !== operationId),
      },
    })
  },

  reset: () => set({ post: null, loading: false, error: null }),
}))
