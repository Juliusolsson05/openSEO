/**
 * blogUiSlice — manages skeleton loader state for the blog post editor.
 *
 * We use React Query's singleton queryClient to directly inject/remove skeleton
 * elements into the cached post data. This keeps the display logic simple.
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { queryClient } from '@/lib/query-client'
import { QK } from '@/lib/query-keys'
import type { BlogPost, BlogPostElement } from '@/types/blog'
import type { AutopilotOperation } from '@/store/types/autopilotTypes'

interface BlogUiState {
  /** Track which postId is currently showing skeletons */
  activePostId: number | null
}

const initialState: BlogUiState = {
  activePostId: null,
}

export const blogUiSlice = createSlice({
  name: 'blogUi',
  initialState,
  reducers: {
    setActivePostId(state, action: PayloadAction<number | null>) {
      state.activePostId = action.payload
    },
  },
})

export const { setActivePostId } = blogUiSlice.actions

// ---------------------------------------------------------------------------
// Skeleton thunks — directly patch React Query cached post data
// ---------------------------------------------------------------------------

export const insertSkeletonLoader =
  (postId: number | string, operationId: number, operation: AutopilotOperation) =>
  () => {
    queryClient.setQueryData<BlogPost>(QK.post(postId), (old) => {
      if (!old) return old
      const skeletonElement: BlogPostElement = {
        id: -operationId,
        element_type: operation.elementType || 'paragraph',
        content: {},
        hyperlink: null,
        created_at: new Date().toISOString(),
        blog_post: typeof postId === 'string' ? Number(postId) : postId,
        isLoading: true,
      }
      const elements = [...old.elements]
      if (operation.type === 'new' && operation.position) {
        const index = elements.findIndex(
          (el) => el.id === operation.position!.afterElementId
        )
        if (index !== -1) elements.splice(index + 1, 0, skeletonElement)
        else elements.push(skeletonElement)
      } else {
        const index = elements.findIndex((el) => el.id === operation.elementId)
        if (index !== -1) elements[index] = { ...elements[index], ...skeletonElement }
      }
      return { ...old, elements }
    })
  }

export const removeSkeletonLoaders =
  (postId: number | string) => () => {
    queryClient.setQueryData<BlogPost>(QK.post(postId), (old) => {
      if (!old) return old
      return { ...old, elements: old.elements.filter((el) => !el.isLoading) }
    })
  }

export const removeSkeletonLoaderByOperationId =
  (postId: number | string, operationId: number) => () => {
    queryClient.setQueryData<BlogPost>(QK.post(postId), (old) => {
      if (!old) return old
      return {
        ...old,
        elements: old.elements.filter(
          (el) => el.id !== -operationId && el.id !== operationId
        ),
      }
    })
  }

export const invalidatePost = (postId: number | string) => () => {
  queryClient.invalidateQueries({ queryKey: QK.post(postId) })
}
