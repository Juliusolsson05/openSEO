'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, apiPost } from '@/lib/api'
import { QK } from '@/lib/query-keys'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/get-error-message'

// ─── Types ────────────────────────────────────────────────────────────────────

export type CompanyProfile = {
  business_description: string
  industry: string
  target_audience: string
  tone_of_voice: string[]
  products_services: string[]
  key_terminology: string[]
  content_topics: string[]
  differentiators: string[]
  detected_language: string
  _scraped_at?: string
  _pages_analyzed?: number
}

export type CompanyProfileResponse = {
  website_url: string | null
  profile: CompanyProfile | null
  name: string
  business_type: string
  language: string
  keywords: unknown
}

export type AnalyzeResponse = { task_id: string; status: string }

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useCompanyProfileQuery() {
  return useQuery({
    queryKey: QK.companyProfile(),
    queryFn: async () => {
      const { data, error } = await api<CompanyProfileResponse>(
        '/api/v1/company/profile'
      )
      if (error) throw error
      return data!
    },
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useUpdateCompanyProfileMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (profile: Partial<CompanyProfile>) => {
      const { data, error } = await api('/api/v1/company/profile', {
        method: 'PATCH',
        body: JSON.stringify({ profile }),
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.companyProfile() })
      toast.success('Company profile updated')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to save company profile'))
    },
  })
}

export function useAnalyzeCompanyMutation() {
  return useMutation({
    mutationFn: async ({ websiteUrl }: { websiteUrl: string }) => {
      const { data, error } = await apiPost<AnalyzeResponse>(
        '/api/v1/company/analyze',
        { website_url: websiteUrl }
      )
      if (error) throw error
      return data!
    },
    onSuccess: () => {
      toast.success('Website analysis started')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to start analysis'))
    },
  })
}
