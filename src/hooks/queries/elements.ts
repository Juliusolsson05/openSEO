'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, apiPost, apiPut, apiDelete } from '@/lib/api'
import { QK } from '@/lib/query-keys'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/get-error-message'
import type { CTA } from '@/types/cta'

// ─── Queries ─────────────────────────────────────────────────────────────────

/** Flat list of all CTAs across all campaigns (used in element editing) */
export function useCTAListQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QK.ctas(),
    queryFn: async () => {
      const data = await api<any[]>('/api/aurora/blog/cta/list/')
      const raw = data ?? []
      return raw.flatMap((campaign: any) =>
        (campaign.ctas ?? []).map((cta: any) => ({
          id: cta.id,
          title: cta.title,
          description: cta.description,
          image_url: cta.image_url,
        }))
      ) as CTA[]
    },
    enabled: options?.enabled ?? true,
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useUpdateElementMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      elementId,
      content,
      blogPostId,
    }: {
      elementId: number
      content: unknown
      blogPostId: number
    }) =>
      apiPut(`/api/aurora/blog/posts/update-element/${elementId}/`, {
        content,
        blog_post: blogPostId,
      }),
    onSuccess: (_data, { blogPostId }) => {
      qc.invalidateQueries({ queryKey: QK.post(blogPostId) })
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to update element'))
    },
  })
}

export function useDeleteElementMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      blogPostId,
      elementId,
    }: {
      blogPostId: number
      elementId: number
    }) =>
      apiDelete(
        `/api/aurora/blog/posts/delete-element/?blog_post_id=${blogPostId}&element_id=${elementId}`,
      ),
    onSuccess: (_data, { blogPostId }) => {
      qc.invalidateQueries({ queryKey: QK.post(blogPostId) })
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to delete element'))
    },
  })
}

export function useRegenerateElementMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      blog_post_id: number
      blog_element_id: number
      regeneration_note: string
      new_element_type?: string
      new_element_count?: number
    }) => apiPost('/api/aurora/blog/posts/elements/regenerate/', payload),
    onSuccess: (_data, { blog_post_id }) => {
      qc.invalidateQueries({ queryKey: QK.post(blog_post_id) })
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to regenerate element'))
    },
  })
}

export function useEnhanceElementMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      blogPostId,
      elementId,
    }: {
      blogPostId: number
      elementId: number
    }) =>
      apiPost('/api/aurora/blog/posts/elements/enhance/', {
        blog_post_id: blogPostId,
        blog_element_id: elementId,
      }),
    onSuccess: (_data, { blogPostId }) => {
      qc.invalidateQueries({ queryKey: QK.post(blogPostId) })
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to enhance element'))
    },
  })
}

export function useHumanizeElementMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      blogPostId,
      elementId,
    }: {
      blogPostId: number
      elementId: number
    }) =>
      apiPost('/api/aurora/blog/posts/elements/humanize/', {
        blog_post_id: blogPostId,
        blog_element_id: elementId,
      }),
    onSuccess: (_data, { blogPostId }) => {
      qc.invalidateQueries({ queryKey: QK.post(blogPostId) })
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to humanize element'))
    },
  })
}

export function useAddElementMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      blog_post_id: number
      element_id: number
      element_type?: string
      generation_note?: string
      cta_id?: number
    }) => {
      const url = payload.cta_id
        ? '/api/aurora/blog/cta/add-cta/'
        : '/api/aurora/blog/posts/elements/add/'
      return apiPost(url, payload)
    },
    onSuccess: (_data, { blog_post_id }) => {
      qc.invalidateQueries({ queryKey: QK.post(blog_post_id) })
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to add element'))
    },
  })
}
