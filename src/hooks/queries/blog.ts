'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, apiPost, apiPut, apiDelete } from '@/lib/api'
import { QK } from '@/lib/query-keys'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/get-error-message'
import type { BlogPost, BlogPostSummary } from '@/types/blog'
import { unwrapList } from '@/lib/utils'

// ─── Queries ────────────────────────────────────────────────────────────────

export function usePostQuery(
  id: number | string | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: QK.post(id ?? ''),
    queryFn: () => api<BlogPost>(`/api/aurora/blog/posts?post_id=${id}`),
    enabled: !!id && (options?.enabled ?? true),
  })
}

export function usePostsQuery(filters?: object) {
  return useQuery({
    queryKey: QK.posts(filters),
    queryFn: async () => {
      const data = await api<unknown>('/api/aurora/blog/posts/')
      return unwrapList<BlogPostSummary>(data)
    },
  })
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useUpdatePostMetaMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      postId,
      payload,
    }: {
      postId: number
      payload: object
    }) =>
      apiPut(`/api/aurora/blog/posts/update_meta/?post_id=${postId}`, payload),
    onSuccess: (_data, { postId }) => {
      qc.invalidateQueries({ queryKey: QK.post(postId) })
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to update post meta'))
    },
  })
}

export function useRegeneratePostMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ postId }: { postId: number }) =>
      apiPost('/api/aurora/blog/posts/regenerate/', { post_id: postId }),
    onSuccess: (_data, { postId }) => {
      qc.invalidateQueries({ queryKey: QK.post(postId) })
      toast.success('Regenerate completed')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Regenerate failed'))
    },
  })
}

export function useDeletePostMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ postId }: { postId: number | string }) =>
      apiDelete(`/api/aurora/blog/posts/delete/${postId}/`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.posts() })
      toast.success('Delete completed')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Delete failed'))
    },
  })
}

export function usePublishPostMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ postId }: { postId: number }) =>
      apiPost('/api/v1/publishing/sync/posts/one', { post_id: postId }),
    onSuccess: (_data, { postId }) => {
      qc.invalidateQueries({ queryKey: QK.post(postId) })
      toast.success('Publish completed')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Publish failed'))
    },
  })
}

export function useGenerateImagesMutation() {
  return useMutation({
    mutationFn: ({
      postId,
      version = 2,
      magicPrompt = true,
      gptPrompt = true,
    }: {
      postId: number
      version?: number
      magicPrompt?: boolean
      gptPrompt?: boolean
    }) =>
      apiPost('/api/aurora/blog/images/generate/', {
        post_id: postId,
        version,
        magic_prompt: magicPrompt,
        gpt_prompt: gptPrompt,
      }),
    onSuccess: () => {
      toast.success('Generate Images completed')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Generate Images failed'))
    },
  })
}

export function useSyncRecommendedPostsMutation() {
  return useMutation({
    mutationFn: ({ postId }: { postId: number }) =>
      apiPost('/api/aurora/blog/posts/sync/recommended/', { post_id: postId }),
    onSuccess: () => {
      toast.success('Sync Posts completed')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Sync Posts failed'))
    },
  })
}

export function useSyncKeywordsMutation() {
  return useMutation({
    mutationFn: ({
      postId,
      dictionaryId = 1,
    }: {
      postId: number
      dictionaryId?: number
    }) =>
      apiPost('/api/aurora/blog/posts/sync/keywords/', {
        post_id: postId,
        dictionary_id: dictionaryId,
      }),
    onSuccess: () => {
      toast.success('Sync Keywords completed')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Sync Keywords failed'))
    },
  })
}

export function useGeneratePostMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (titleId?: number) => {
      const body = titleId ? { title_id: titleId } : {}
      return apiPost('/api/aurora/blog/posts/generate/', body)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.posts() })
      qc.invalidateQueries({ queryKey: QK.titles() })
      toast.success('Blog post generated')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to generate post'))
    },
  })
}
