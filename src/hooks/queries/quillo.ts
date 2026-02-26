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
    mutationFn: async ({ blogPostId }: { blogPostId: number }) => {
      const { data, error } = await apiPost<AnalysisResult>(
        '/api/aurora/blog/quillo/analyze/',
        { blog_post_id: blogPostId }
      )
      if (error) throw error
      return data!
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Could not analyze. Please try again.'))
    },
  })
}

export function useQuilloChatMutation() {
  return useMutation({
    mutationFn: async ({
      blogPostId,
      messages,
    }: {
      blogPostId: number
      messages: QuilloMessage[]
    }) => {
      const { data, error } = await apiPost<{ message: string }>(
        '/api/aurora/blog/quillo/chat/',
        { blog_post_id: blogPostId, messages }
      )
      if (error) throw error
      return data!
    },
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
      const { data, error } = await apiPost<string>(
        '/api/aurora/blog/quillo/analyze/chat',
        { blog_post_id: blogPostId, question }
      )
      if (error) throw error
      return data ?? 'No response.'
    },
  })
}

export function useConvertToFacebookMutation() {
  return useMutation({
    mutationFn: async ({ blogPostId }: { blogPostId: number }) => {
      const { data, error } = await apiPost<{ facebook_post?: string }>(
        '/api/aurora/blog/quillo/post/facebook',
        { blog_post_id: blogPostId }
      )
      if (error) throw error
      return data
    },
  })
}

export function useConvertToLinkedInMutation() {
  return useMutation({
    mutationFn: async ({ blogPostId }: { blogPostId: number }) => {
      const { data, error } = await api<{ json: any; html: string }>(
        `/api/aurora/debug/testing_linkedin_whole/?blog_post_id=${blogPostId}`
      )
      if (error) throw error
      return data!
    },
  })
}
