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
import type { AutopilotOperation } from '@/types/autopilot'

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
// Operation id helper
// ---------------------------------------------------------------------------

/**
 * Generate a client-only operation id. The `op_` prefix plus a uuid
 * guarantees this value can never collide with a server-assigned numeric
 * BlogPostElement.id, so filters by id are always unambiguous.
 */
export const newOperationId = (): string => `op_${crypto.randomUUID()}`

// ---------------------------------------------------------------------------
// Skeleton thunks — directly patch React Query cached post data
// ---------------------------------------------------------------------------

/**
 * Insert a skeleton loader for an operation.
 *
 * - For `type === 'new'` (add element / autopilot planned inserts) a brand-new
 *   placeholder element is spliced in; its id is the operation id itself.
 * - For overlay operations (regenerate / enhance / humanize / image rewrite)
 *   the targeted element is NOT replaced. We shallow-clone it, snapshot the
 *   original under `previousElement`, and set `isLoading` + `loadingOperationId`
 *   on the clone so the real content stays available in the cache.
 */
export const insertSkeletonLoader =
  (postId: number | string, operationId: string, operation: AutopilotOperation) =>
  () => {
    queryClient.setQueryData<BlogPost>(QK.post(postId), (old) => {
      if (!old) return old
      const elements = [...old.elements]

      if (operation.type === 'new' && operation.position) {
        const placeholder: BlogPostElement = {
          id: operationId,
          element_type: operation.elementType || 'paragraph',
          content: {},
          hyperlink: null,
          created_at: new Date().toISOString(),
          blog_post: typeof postId === 'string' ? Number(postId) : postId,
          isLoading: true,
          loadingOperationId: operationId,
        }
        const index = elements.findIndex(
          (el) => el.id === operation.position!.afterElementId
        )
        if (index !== -1) elements.splice(index + 1, 0, placeholder)
        else elements.push(placeholder)
        return { ...old, elements }
      }

      // Overlay: preserve the original element's fields, stash a snapshot.
      const index = elements.findIndex((el) => el.id === operation.elementId)
      if (index === -1) return old
      const original = elements[index]
      elements[index] = {
        ...original,
        isLoading: true,
        loadingOperationId: operationId,
        previousElement: original,
      }
      return { ...old, elements }
    })
  }

/**
 * Remove a skeleton loader.
 *
 * - For insert-style placeholders (id === operationId) the placeholder is
 *   filtered out of the list.
 * - For overlay-style placeholders the original snapshot stored in
 *   `previousElement` is restored, so a failed regenerate/enhance never
 *   nukes the user's real content.
 */
export const removeSkeletonLoaderByOperationId =
  (postId: number | string, operationId: string) => () => {
    queryClient.setQueryData<BlogPost>(QK.post(postId), (old) => {
      if (!old) return old
      const elements: BlogPostElement[] = []
      for (const el of old.elements) {
        if (el.loadingOperationId !== operationId && el.id !== operationId) {
          elements.push(el)
          continue
        }
        if (el.previousElement) {
          // Overlay — restore original.
          elements.push(el.previousElement)
        }
        // else: insert-style placeholder — drop it entirely.
      }
      return { ...old, elements }
    })
  }

/**
 * Sweep all in-flight skeleton placeholders for a post. Used by autopilot
 * stop / completion paths. Overlay placeholders are restored, insert
 * placeholders are dropped.
 */
export const removeSkeletonLoaders =
  (postId: number | string) => () => {
    queryClient.setQueryData<BlogPost>(QK.post(postId), (old) => {
      if (!old) return old
      const elements: BlogPostElement[] = []
      for (const el of old.elements) {
        if (!el.isLoading) {
          elements.push(el)
          continue
        }
        if (el.previousElement) elements.push(el.previousElement)
        // else drop
      }
      return { ...old, elements }
    })
  }

export const invalidatePost = (postId: number | string) => () => {
  queryClient.invalidateQueries({ queryKey: QK.post(postId) })
}
