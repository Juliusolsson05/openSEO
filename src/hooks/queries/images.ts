'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { api, apiPost } from '@/lib/api'
import { QK } from '@/lib/query-keys'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/get-error-message'

export interface PexelsImage {
  id: number
  photographer: string
  src: { original: string; large: string; medium: string }
}

export interface SearchImagesResponse {
  page: number
  per_page: number
  total_results: number
  images: PexelsImage[]
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export function usePexelsSearchQuery(
  query: string,
  page = 1,
  perPage = 12,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...QK.pexels(query), page, perPage],
    queryFn: () =>
      api<SearchImagesResponse>(
        '/api/aurora/blog/images/stock_photos/search',
        { params: { query, page, per_page: perPage } },
      ),
    enabled: !!query.trim() && (options?.enabled ?? true),
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

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
      toast.success('Image generation started')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to generate images'))
    },
  })
}

export function useApplyImageMutation() {
  return useMutation({
    mutationFn: ({
      blogId,
      imageNumber,
      imageUrl,
      description,
      prompt,
    }: {
      blogId: number
      imageNumber: number
      imageUrl: string
      description?: string
      prompt?: string
    }) =>
      apiPost('/api/aurora/blog/images/apply/', {
        blog_post_id: blogId,
        image_number: imageNumber,
        image_url: imageUrl,
        description,
        prompt,
      }),
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to apply image'))
    },
  })
}
