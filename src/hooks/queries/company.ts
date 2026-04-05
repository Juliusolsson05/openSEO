'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, apiPost } from '@/lib/api'
import { QK } from '@/lib/query-keys'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/get-error-message'
import type { CompanyProfile, CompanyProfileResponse, AnalyzeResponse } from '@/types/company'

export type { CompanyProfile, CompanyProfileResponse, AnalyzeResponse }

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useCompanyProfileQuery() {
  return useQuery({
    queryKey: QK.companyProfile(),
    queryFn: () =>
      api<CompanyProfileResponse>('/api/v1/company/profile'),
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useUpdateCompanyProfileMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (profile: Partial<CompanyProfile>) =>
      api('/api/v1/company/profile', {
        method: 'PATCH',
        body: JSON.stringify({ profile }),
      }),
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
    mutationFn: ({ websiteUrl }: { websiteUrl: string }) =>
      apiPost<AnalyzeResponse>('/api/v1/company/analyze', {
        website_url: websiteUrl,
      }),
    onSuccess: () => {
      toast.success('Website analysis started')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to start analysis'))
    },
  })
}
