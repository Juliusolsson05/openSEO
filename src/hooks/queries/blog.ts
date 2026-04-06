'use client'

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, apiPost, apiPut, apiDelete } from '@/lib/api'
import { QK } from '@/lib/query-keys'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/get-error-message'
import type { BlogPost, BlogPostSummary } from '@/types/blog'


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

type PostsPage = {
  result: number
  next: string | null
  previous: string | null
  data: BlogPostSummary[]
}

const POSTS_PAGE_SIZE = 100

export function usePostsQuery(filters?: object) {
  return useInfiniteQuery({
    queryKey: ['posts', 'infinite', filters ?? null] as const,
    queryFn: async ({ pageParam }) => {
      const data = await api<PostsPage | BlogPostSummary[]>(
        `/api/aurora/blog/posts/?page=${pageParam}&limit=${POSTS_PAGE_SIZE}`
      )
      if (Array.isArray(data)) {
        return { result: data.length, next: null, previous: null, data } as PostsPage
      }
      return (data ?? { result: 0, next: null, previous: null, data: [] }) as PostsPage
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (!lastPage || lastPage.next === null) return undefined
      const totalPages = Math.max(1, Math.ceil(lastPage.result / POSTS_PAGE_SIZE))
      return (lastPageParam as number) < totalPages ? (lastPageParam as number) + 1 : undefined
    },
  })
}

/**
 * Fetches ALL posts by looping pages internally. Use for analytics /
 * aggregate views that need the complete dataset. For list UIs with
 * visible pagination, prefer `usePostsQuery` (useInfiniteQuery).
 */
export function useAllPostsQuery(filters?: object) {
  return useQuery({
    queryKey: ['posts', 'all', filters ?? null] as const,
    queryFn: async (): Promise<BlogPostSummary[]> => {
      const limit = 100
      const all: BlogPostSummary[] = []
      let page = 1
      for (let i = 0; i < 100; i++) {
        const data = await api<PostsPage | BlogPostSummary[]>(
          `/api/aurora/blog/posts/?page=${page}&limit=${limit}`
        )
        const pageData = Array.isArray(data) ? data : (data?.data ?? [])
        all.push(...pageData)
        const hasNext = Array.isArray(data) ? false : data?.next != null
        if (!hasNext || pageData.length < limit) break
        page += 1
      }
      return all
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
      qc.invalidateQueries({ queryKey: ['posts'] })
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
      qc.invalidateQueries({ queryKey: ['posts'] })
      qc.invalidateQueries({ queryKey: ['titles'] })
      toast.success('Blog post generated')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to generate post'))
    },
  })
}
