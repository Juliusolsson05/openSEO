'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, apiPost } from '@/lib/api'
import { QK } from '@/lib/query-keys'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/get-error-message'
import type { GenerationSettings, PublishingSettings, ApiKey, IntegrationSetting, SetupStatus } from '@/types/settings'

export type { GenerationSettings, PublishingSettings, ApiKey, IntegrationSetting, SetupStatus }

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

export function useIntegrationsQuery() {
  return useQuery({
    queryKey: QK.integrations(),
    queryFn: async () => {
      const { data, error } = await api<{ success?: boolean; data?: IntegrationSetting[] }>('/api/v1/settings/integrations')
      if (error) throw error
      return data?.data ?? []
    },
  })
}

export function useSetupStatusQuery() {
  return useQuery({
    queryKey: QK.setupStatus(),
    queryFn: async () => {
      const { data, error } = await api<{ success?: boolean; data?: SetupStatus }>('/api/setup/status')
      if (error) throw error
      return data?.data ?? null
    },
    staleTime: 10_000,
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
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to save generation settings'))
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
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to update credentials'))
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
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to create inbound key'))
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
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to revoke key'))
    },
  })
}

export function useUpsertIntegrationMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { key: string; value: string }) => {
      const { data, error } = await apiPost<{ success?: boolean; data?: IntegrationSetting }>(
        '/api/v1/settings/integrations',
        payload,
      )
      if (error) throw error
      return data?.data ?? null
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.integrations() })
      qc.invalidateQueries({ queryKey: QK.setupStatus() })
      toast.success('Integration saved')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to save integration'))
    },
  })
}

export function useDeleteIntegrationMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (key: string) => {
      const { data, error } = await api(`/api/v1/settings/integrations/${encodeURIComponent(key)}`, {
        method: 'DELETE',
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.integrations() })
      qc.invalidateQueries({ queryKey: QK.setupStatus() })
      toast.success('Integration deleted')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to delete integration'))
    },
  })
}

export function useTestIntegrationMutation() {
  return useMutation({
    mutationFn: async (payload: { key: string; value?: string }) => {
      const { data, error } = await apiPost<{ success?: boolean; data?: { ok: boolean; error?: string } }>(
        '/api/v1/settings/integrations/test',
        payload,
      )
      if (error) throw error
      return data?.data ?? { ok: false, error: 'Unknown error' }
    },
  })
}
