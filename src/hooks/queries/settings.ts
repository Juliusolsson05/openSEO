'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, apiPost } from '@/lib/api'
import { QK } from '@/lib/query-keys'
import { toast } from 'sonner'

// ─── Types ────────────────────────────────────────────────────────────────────

export type GenerationSettings = {
  blog_post_structure_model: string
  blog_post_content_model: string
  initial_generation_elements: Record<string, boolean>
}

export type PublishingSettings = {
  api_endpoint?: string | null
  has_api_key?: boolean
}

export type ApiKey = {
  id: number
  name: string
  key_prefix: string
  is_active: boolean
  key?: string
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useGenerationSettingsQuery() {
  return useQuery({
    queryKey: QK.generationSettings(),
    queryFn: async () => {
      const { data, error } = await api<{
        success?: boolean
        data?: { settings?: GenerationSettings }
      }>('/api/v1/settings/generation')
      if (error) throw error
      return data?.data?.settings ?? null
    },
  })
}

export function usePublishingSettingsQuery() {
  return useQuery({
    queryKey: QK.publishingSettings(),
    queryFn: async () => {
      const { data, error } = await api<{ settings?: PublishingSettings }>(
        '/api/v1/settings/publishing'
      )
      if (error) throw error
      return data?.settings ?? null
    },
  })
}

export function useApiKeysQuery() {
  return useQuery({
    queryKey: QK.apiKeys(),
    queryFn: async () => {
      const { data, error } = await api<ApiKey[] | { data: ApiKey[] }>(
        '/api/v1/publishing/api-keys'
      )
      if (error) throw error
      return Array.isArray(data) ? data : (data?.data ?? [])
    },
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useUpdateGenerationSettingsMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (settings: Partial<GenerationSettings>) => {
      const { data, error } = await api('/api/v1/settings/generation', {
        method: 'PATCH',
        body: JSON.stringify(settings),
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.generationSettings() })
      toast.success('Generation settings saved')
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to save generation settings')
    },
  })
}

export function useUpdatePublishingSettingsMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      api_endpoint: string
      api_key?: string
    }) => {
      const { data, error } = await api('/api/v1/settings/publishing', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.publishingSettings() })
      toast.success('Credentials updated')
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update credentials')
    },
  })
}

export function useCreateApiKeyMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      const { data, error } = await apiPost<ApiKey | { data: ApiKey }>(
        '/api/v1/publishing/api-keys',
        { name }
      )
      if (error) throw error
      const payload =
        data && typeof data === 'object' && 'data' in data
          ? (data.data as ApiKey)
          : (data as ApiKey | null)
      return payload
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.apiKeys() })
      toast.success('Inbound key created')
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to create inbound key')
    },
  })
}

export function useRevokeApiKeyMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data, error } = await apiPost(
        `/api/v1/publishing/api-keys/${id}/revoke`,
        {}
      )
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.apiKeys() })
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to revoke key')
    },
  })
}
