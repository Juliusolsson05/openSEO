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

const ensureLeadingSlash = (link: string) => (link.startsWith('/') ? link : `/${link}`)

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
      const { data, error } = await api<any[]>('/api/aurora/blog/cta/list/')
      if (error) throw error
      return transformCampaigns(data ?? [])
    },
    enabled: options?.enabled ?? true,
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateCampaignMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      const { data, error } = await apiPost('/api/aurora/blog/cta/campaign/create/', { name })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.campaigns() })
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
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const { data, error } = await apiPut(
        `/api/aurora/blog/cta/campaign/edit/${id}/`,
        { name }
      )
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.campaigns() })
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
    mutationFn: async (id: number) => {
      const { data, error } = await apiDelete(
        `/api/aurora/blog/cta/campaign/delete/${id}/`
      )
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.campaigns() })
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
          : process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'
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
          : process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'
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
    mutationFn: async (ctaId: number) => {
      const { data, error } = await apiDelete(
        `/api/aurora/blog/cta/delete/${ctaId}/`
      )
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.campaigns() })
      toast.success('CTA deleted')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to delete CTA'))
    },
  })
}
