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
      const data = await api<{ settings?: GenerationSettings }>(
        '/api/v1/settings/generation',
      )
      return data?.settings ?? null
    },
  })
}

export function usePublishingSettingsQuery() {
  return useQuery({
    queryKey: QK.publishingSettings(),
    queryFn: async () => {
      const data = await api<{ settings?: PublishingSettings }>(
        '/api/v1/settings/publishing',
      )
      return data?.settings ?? null
    },
  })
}

export function useApiKeysQuery() {
  return useQuery({
    queryKey: QK.apiKeys(),
    queryFn: async () => {
      const data = await api<ApiKey[]>('/api/v1/publishing/api-keys')
      return data ?? []
    },
  })
}

export function useIntegrationsQuery() {
  return useQuery({
    queryKey: QK.integrations(),
    queryFn: async () => {
      const data = await api<IntegrationSetting[]>(
        '/api/v1/settings/integrations',
      )
      return data ?? []
    },
  })
}

export function useSetupStatusQuery() {
  return useQuery({
    queryKey: QK.setupStatus(),
    queryFn: async () => {
      const data = await api<SetupStatus>('/api/setup/status')
      return data ?? null
    },
    staleTime: 10_000,
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useUpdateGenerationSettingsMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (settings: Partial<GenerationSettings>) =>
      api('/api/v1/settings/generation', {
        method: 'PATCH',
        body: JSON.stringify(settings),
      }),
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
    mutationFn: (payload: { api_endpoint: string; api_key?: string }) =>
      api('/api/v1/settings/publishing', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
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
    mutationFn: ({ name }: { name: string }) =>
      apiPost<ApiKey>('/api/v1/publishing/api-keys', { name }),
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
    mutationFn: (id: number) =>
      apiPost(`/api/v1/publishing/api-keys/${id}/revoke`, {}),
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
      const data = await apiPost<IntegrationSetting>(
        '/api/v1/settings/integrations',
        payload,
      )
      return data ?? null
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
    mutationFn: (key: string) =>
      api(`/api/v1/settings/integrations/${encodeURIComponent(key)}`, {
        method: 'DELETE',
      }),
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
      const data = await apiPost<{ ok: boolean; error?: string }>(
        '/api/v1/settings/integrations/test',
        payload,
      )
      return data ?? { ok: false, error: 'Unknown error' }
    },
  })
}
