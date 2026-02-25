'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, apiPost, apiPut, apiDelete } from '@/lib/api'
import { QK } from '@/lib/query-keys'
import { toast } from 'sonner'
import type { BlogPost } from '@/types/blog'

// ─── Queries ────────────────────────────────────────────────────────────────

export function usePostQuery(
  id: number | string | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: QK.post(id ?? ''),
    queryFn: async () => {
      const { data, error } = await api<BlogPost>(`/api/aurora/blog/posts?post_id=${id}`)
      if (error) throw error
      return data!
    },
    enabled: !!id && (options?.enabled ?? true),
  })
}

interface BlogPostSummary {
  id: number
  title_text: string
  slug: string
  status: number | string
  is_published: boolean
  created_at: string
  cover_image: { url: string; description: string } | null
  elements: { id: number; element_type: string }[]
  focus_keyword: string
  excerpt: string
}

function unwrapList<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[]
  if (!raw || typeof raw !== 'object') return []
  const obj = raw as Record<string, unknown>
  const nested = obj.data ?? obj.results ?? obj.items
  return Array.isArray(nested) ? (nested as T[]) : []
}

export function usePostsQuery(filters?: object) {
  return useQuery({
    queryKey: QK.posts(filters),
    queryFn: async () => {
      const { data, error } = await api<unknown>('/api/aurora/blog/posts/')
      if (error) throw error
      return unwrapList<BlogPostSummary>(data)
    },
  })
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useUpdatePostMetaMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      postId,
      payload,
    }: {
      postId: number
      payload: object
    }) => {
      const { data, error } = await apiPut(
        `/api/aurora/blog/posts/update_meta/?post_id=${postId}`,
        payload
      )
      if (error) throw error
      return data
    },
    onSuccess: (_data, { postId }) => {
      qc.invalidateQueries({ queryKey: QK.post(postId) })
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update post meta')
    },
  })
}

export function useRegeneratePostMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ postId }: { postId: number }) => {
      const { data, error } = await apiPost('/api/aurora/blog/posts/regenerate/', {
        post_id: postId,
      })
      if (error) throw error
      return data
    },
    onSuccess: (_data, { postId }) => {
      qc.invalidateQueries({ queryKey: QK.post(postId) })
      toast.success('Regenerate completed')
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Regenerate failed')
    },
  })
}

export function useDeletePostMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ postId }: { postId: number | string }) => {
      const { data, error } = await apiDelete(
        `/api/aurora/blog/posts/delete/${postId}/`
      )
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.posts() })
      toast.success('Delete completed')
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Delete failed')
    },
  })
}

export function usePublishPostMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ postId }: { postId: number }) => {
      const { data, error } = await apiPost('/api/v1/publishing/sync/posts/one', {
        post_id: postId,
      })
      if (error) throw error
      return data
    },
    onSuccess: (_data, { postId }) => {
      qc.invalidateQueries({ queryKey: QK.post(postId) })
      toast.success('Publish completed')
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Publish failed')
    },
  })
}

export function useGenerateImagesMutation() {
  return useMutation({
    mutationFn: async ({
      postId,
      version = 2,
      magicPrompt = true,
      gptPrompt = true,
    }: {
      postId: number
      version?: number
      magicPrompt?: boolean
      gptPrompt?: boolean
    }) => {
      const { data, error } = await apiPost('/api/aurora/blog/images/generate/', {
        post_id: postId,
        version,
        magic_prompt: magicPrompt,
        gpt_prompt: gptPrompt,
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Generate Images completed')
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Generate Images failed')
    },
  })
}

export function useSyncRecommendedPostsMutation() {
  return useMutation({
    mutationFn: async ({ postId }: { postId: number }) => {
      const { data, error } = await apiPost(
        '/api/aurora/blog/posts/sync/recommended/',
        { post_id: postId }
      )
      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Sync Posts completed')
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Sync Posts failed')
    },
  })
}

export function useSyncKeywordsMutation() {
  return useMutation({
    mutationFn: async ({
      postId,
      dictionaryId = 1,
    }: {
      postId: number
      dictionaryId?: number
    }) => {
      const { data, error } = await apiPost(
        '/api/aurora/blog/posts/sync/keywords/',
        { post_id: postId, dictionary_id: dictionaryId }
      )
      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Sync Keywords completed')
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Sync Keywords failed')
    },
  })
}

export function useGeneratePostMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (titleId?: number) => {
      const body = titleId ? { title_id: titleId } : {}
      const { data, error } = await apiPost('/api/aurora/blog/posts/generate/', body)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.posts() })
      qc.invalidateQueries({ queryKey: QK.titles() })
      toast.success('Blog post generated')
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to generate post')
    },
  })
}
