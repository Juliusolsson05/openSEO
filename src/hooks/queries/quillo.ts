'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { api, apiPost } from '@/lib/api'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/get-error-message'

export interface AnalysisResult {
  overall_analysis?: {
    overall_score: number
    summary: string
    strengths: string[]
    weaknesses: string[]
  }
  seo_improvements?: Array<{
    suggestion: string
    reason: string
    importance: string
  }>
  content_improvements?: Array<{
    suggestion: string
    reason: string
    proposed_changes?: string
  }>
}

export interface QuilloMessage {
  role: 'user' | 'assistant'
  content: string
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useQuilloAnalyzeMutation() {
  return useMutation({
    mutationFn: ({ blogPostId }: { blogPostId: number }) =>
      apiPost<AnalysisResult>('/api/aurora/blog/quillo/analyze/', {
        blog_post_id: blogPostId,
      }),
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Could not analyze. Please try again.'))
    },
  })
}

export function useQuilloChatMutation() {
  return useMutation({
    mutationFn: ({
      blogPostId,
      messages,
    }: {
      blogPostId: number
      messages: QuilloMessage[]
    }) =>
      apiPost<{ message: string }>('/api/aurora/blog/quillo/analyze/chat', {
        blog_post_id: blogPostId,
        messages,
      }),
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Chat request failed.'))
    },
  })
}

export function useQuilloChatSendMutation() {
  return useMutation({
    mutationFn: async ({
      blogPostId,
      question,
    }: {
      blogPostId: number
      question: string
    }) => {
      const data = await apiPost<string>(
        '/api/aurora/blog/quillo/analyze/chat',
        { blog_post_id: blogPostId, question },
      )
      return data ?? 'No response.'
    },
  })
}

export function useConvertToFacebookMutation() {
  return useMutation({
    mutationFn: ({ blogPostId }: { blogPostId: number }) =>
      apiPost<{ facebook_post?: string }>(
        '/api/aurora/blog/quillo/post/facebook',
        { blog_post_id: blogPostId },
      ),
  })
}

export function useConvertToLinkedInMutation() {
  return useMutation({
    mutationFn: ({ blogPostId }: { blogPostId: number }) =>
      api<{ json: any; html: string }>('/api/aurora/blog/linkedin/convert', {
        params: { blog_post_id: blogPostId },
      }),
  })
}
