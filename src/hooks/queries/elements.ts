'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, apiPost, apiPut, apiDelete } from '@/lib/api'
import { QK } from '@/lib/query-keys'
import { toast } from 'sonner'
import type { CTA } from '@/types/cta'

// ─── Queries ─────────────────────────────────────────────────────────────────

/** Flat list of all CTAs across all campaigns (used in element editing) */
export function useCTAListQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QK.campaigns(),
    queryFn: async () => {
      const { data, error } = await api<any[]>('/api/aurora/blog/cta/list/')
      if (error) throw error
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
    mutationFn: async ({
      elementId,
      content,
      blogPostId,
    }: {
      elementId: number
      content: unknown
      blogPostId: number
    }) => {
      const { data, error } = await apiPut(
        `/api/aurora/blog/posts/update-element/${elementId}/`,
        { content, blog_post: blogPostId }
      )
      if (error) throw error
      return data
    },
    onSuccess: (_data, { blogPostId }) => {
      qc.invalidateQueries({ queryKey: QK.post(blogPostId) })
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update element')
    },
  })
}

export function useDeleteElementMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      blogPostId,
      elementId,
    }: {
      blogPostId: number
      elementId: number
    }) => {
      const { data, error } = await apiDelete(
        `/api/aurora/blog/posts/delete-element/?blog_post_id=${blogPostId}&element_id=${elementId}`
      )
      if (error) throw error
      return data
    },
    onSuccess: (_data, { blogPostId }) => {
      qc.invalidateQueries({ queryKey: QK.post(blogPostId) })
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete element')
    },
  })
}

export function useRegenerateElementMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      blog_post_id: number
      blog_element_id: number
      regeneration_note: string
      new_element_type?: string
      new_element_count?: number
    }) => {
      const { data, error } = await apiPost(
        '/api/aurora/blog/posts/elements/regenerate/',
        payload
      )
      if (error) throw error
      return data
    },
    onSuccess: (_data, { blog_post_id }) => {
      qc.invalidateQueries({ queryKey: QK.post(blog_post_id) })
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to regenerate element')
    },
  })
}

export function useEnhanceElementMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      blogPostId,
      elementId,
    }: {
      blogPostId: number
      elementId: number
    }) => {
      const { data, error } = await apiPost(
        '/api/aurora/blog/posts/elements/enhance/',
        { blog_post_id: blogPostId, blog_element_id: elementId }
      )
      if (error) throw error
      return data
    },
    onSuccess: (_data, { blogPostId }) => {
      qc.invalidateQueries({ queryKey: QK.post(blogPostId) })
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to enhance element')
    },
  })
}

export function useHumanizeElementMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      blogPostId,
      elementId,
    }: {
      blogPostId: number
      elementId: number
    }) => {
      const { data, error } = await apiPost(
        '/api/aurora/blog/posts/elements/humanize/',
        { blog_post_id: blogPostId, blog_element_id: elementId }
      )
      if (error) throw error
      return data
    },
    onSuccess: (_data, { blogPostId }) => {
      qc.invalidateQueries({ queryKey: QK.post(blogPostId) })
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to humanize element')
    },
  })
}

export function useAddElementMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      blog_post_id: number
      element_id: number
      element_type?: string
      generation_note?: string
      cta_id?: number
    }) => {
      const url = payload.cta_id
        ? '/api/aurora/blog/cta/add-cta/'
        : '/api/aurora/blog/posts/elements/add/'
      const { data, error } = await apiPost(url, payload)
      if (error) throw error
      return data
    },
    onSuccess: (_data, { blog_post_id }) => {
      qc.invalidateQueries({ queryKey: QK.post(blog_post_id) })
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to add element')
    },
  })
}
