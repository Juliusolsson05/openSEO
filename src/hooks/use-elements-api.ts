'use client'

/**
 * useElementsApi — wraps React Query element mutations in the same interface
 * as the old useElementsStore, so existing element components don't need
 * to be individually rewritten.
 */

import { useCallback } from 'react'
import {
  useUpdateElementMutation,
  useDeleteElementMutation,
  useRegenerateElementMutation,
  useEnhanceElementMutation,
  useHumanizeElementMutation,
  useAddElementMutation,
} from '@/hooks/queries/elements'

type OpResult = { success: boolean; error?: string }

export function useElementsApi() {
  const updateElementMutation = useUpdateElementMutation()
  const deleteElementMutation = useDeleteElementMutation()
  const regenerateElementMutation = useRegenerateElementMutation()
  const enhanceElementMutation = useEnhanceElementMutation()
  const humanizeElementMutation = useHumanizeElementMutation()
  const addElementMutation = useAddElementMutation()

  const updateElement = useCallback(
    async (elementId: number, content: unknown, blogPostId: number): Promise<OpResult> => {
      try {
        await updateElementMutation.mutateAsync({ elementId, content, blogPostId })
        return { success: true }
      } catch (e: any) {
        return { success: false, error: e?.message || e?.data?.detail || 'Failed to update element' }
      }
    },
    [updateElementMutation]
  )

  const deleteElement = useCallback(
    async (blogPostId: number, elementId: number): Promise<OpResult> => {
      try {
        await deleteElementMutation.mutateAsync({ blogPostId, elementId })
        return { success: true }
      } catch (e: any) {
        return { success: false, error: e?.message || e?.data?.detail || 'Failed to delete element' }
      }
    },
    [deleteElementMutation]
  )

  const regenerateElement = useCallback(
    async (payload: {
      blog_post_id: number
      blog_element_id: number
      regeneration_note: string
      new_element_type?: string
      new_element_count?: number
    }): Promise<OpResult> => {
      try {
        await regenerateElementMutation.mutateAsync(payload)
        return { success: true }
      } catch (e: any) {
        return {
          success: false,
          error: e?.message || e?.data?.detail || 'Failed to regenerate element',
        }
      }
    },
    [regenerateElementMutation]
  )

  const enhanceElement = useCallback(
    async (blogPostId: number, elementId: number): Promise<OpResult> => {
      try {
        await enhanceElementMutation.mutateAsync({ blogPostId, elementId })
        return { success: true }
      } catch (e: any) {
        return {
          success: false,
          error: e?.message || e?.data?.detail || 'Failed to enhance element',
        }
      }
    },
    [enhanceElementMutation]
  )

  const humanizeElement = useCallback(
    async (blogPostId: number, elementId: number): Promise<OpResult> => {
      try {
        await humanizeElementMutation.mutateAsync({ blogPostId, elementId })
        return { success: true }
      } catch (e: any) {
        return {
          success: false,
          error: e?.message || e?.data?.detail || 'Failed to humanize element',
        }
      }
    },
    [humanizeElementMutation]
  )

  const addElement = useCallback(
    async (payload: {
      blog_post_id: number
      element_id: number
      element_type?: string
      generation_note?: string
      cta_id?: number
    }): Promise<OpResult> => {
      try {
        await addElementMutation.mutateAsync(payload)
        return { success: true }
      } catch (e: any) {
        return { success: false, error: e?.message || e?.data?.detail || 'Failed to add element' }
      }
    },
    [addElementMutation]
  )

  return {
    updateElement,
    deleteElement,
    regenerateElement,
    enhanceElement,
    humanizeElement,
    addElement,
  }
}
