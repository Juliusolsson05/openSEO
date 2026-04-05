'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, apiPost, apiPut, apiDelete } from '@/lib/api'
import { QK } from '@/lib/query-keys'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/get-error-message'
import type { CTA } from '@/types/cta'

export interface Campaign {
  id: number
  name: string
  ctas: CTA[]
}

/**
 * Normalize a CTA link so relative paths become root-relative (`/foo`),
 * while leaving absolute URLs, protocol-prefixed links, and empty strings
 * untouched. Dangerous schemes (javascript:, data:, vbscript:, file:)
 * are explicitly neutralized by returning '#' so that a future refactor
 * cannot accidentally strip this protection.
 */
const ensureLeadingSlash = (link: string): string => {
  if (!link) return link
  if (/^\s*(javascript|data|vbscript|file):/i.test(link)) return '#'
  if (/^(https?:|mailto:|tel:|\/\/)/i.test(link)) return link
  return link.startsWith('/') ? link : `/${link}`
}

function transformCampaigns(raw: any[]): Campaign[] {
  return raw.map((campaign) => ({
    id: campaign.id,
    name: campaign.name,
    ctas: (campaign.ctas ?? []).map((cta: any) => ({
      id: cta.id,
      title: cta.title,
      description: cta.description,
      image: cta.image_url ?? cta.image ?? '',
      link: cta.link,
    })),
  }))
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useCampaignsQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QK.campaigns(),
    queryFn: async () => {
      const data = await api<any[]>('/api/aurora/blog/cta/list/')
      return transformCampaigns(data ?? [])
    },
    enabled: options?.enabled ?? true,
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateCampaignMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ name }: { name: string }) =>
      apiPost('/api/aurora/blog/cta/campaign/create/', { name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.campaigns() })
      qc.invalidateQueries({ queryKey: QK.ctas() })
      toast.success('Campaign created')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to create campaign'))
    },
  })
}

export function useEditCampaignMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      apiPut(`/api/aurora/blog/cta/campaign/edit/${id}/`, { name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.campaigns() })
      qc.invalidateQueries({ queryKey: QK.ctas() })
      toast.success('Campaign updated')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to edit campaign'))
    },
  })
}

export function useDeleteCampaignMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      apiDelete(`/api/aurora/blog/cta/campaign/delete/${id}/`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.campaigns() })
      qc.invalidateQueries({ queryKey: QK.ctas() })
      toast.success('Campaign deleted')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to delete campaign'))
    },
  })
}

export function useCreateCTAMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      campaignId,
      title,
      description,
      link,
      generateImage,
      image,
    }: {
      campaignId: number
      title: string
      description: string
      link: string
      generateImage: boolean
      image?: File | null
    }) => {
      const formData = new FormData()
      formData.append('campaign_id', String(campaignId))
      formData.append('title', title.trim())
      formData.append('description', description.trim())
      formData.append('link', ensureLeadingSlash(link.trim()))
      if (!generateImage && image) formData.append('image', image)
      formData.append('generate_image', String(generateImage))

      const baseUrl =
        typeof window !== 'undefined'
          ? process.env.NEXT_PUBLIC_API_BASE_URL || ''
          : process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4720'
      const res = await fetch(`${baseUrl}/api/aurora/blog/cta/create/`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.detail || `HTTP ${res.status}`)
      }
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.campaigns() })
      qc.invalidateQueries({ queryKey: QK.ctas() })
      toast.success('CTA created')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to create CTA'))
    },
  })
}

export function useEditCTAMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      ctaId,
      title,
      description,
      link,
      generateImage,
      image,
    }: {
      ctaId: number
      title: string
      description: string
      link: string
      generateImage: boolean
      image?: File | null
    }) => {
      const formData = new FormData()
      formData.append('title', title.trim())
      formData.append('description', description.trim())
      formData.append('link', ensureLeadingSlash(link.trim()))
      if (!generateImage && image) formData.append('image', image)
      formData.append('generate_image', String(generateImage))

      const baseUrl =
        typeof window !== 'undefined'
          ? process.env.NEXT_PUBLIC_API_BASE_URL || ''
          : process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4720'
      const res = await fetch(`${baseUrl}/api/aurora/blog/cta/edit/${ctaId}/`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.detail || `HTTP ${res.status}`)
      }
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.campaigns() })
      qc.invalidateQueries({ queryKey: QK.ctas() })
      toast.success('CTA updated')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to edit CTA'))
    },
  })
}

export function useDeleteCTAMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ctaId: number) =>
      apiDelete(`/api/aurora/blog/cta/delete/${ctaId}/`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.campaigns() })
      qc.invalidateQueries({ queryKey: QK.ctas() })
      toast.success('CTA deleted')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to delete CTA'))
    },
  })
}
