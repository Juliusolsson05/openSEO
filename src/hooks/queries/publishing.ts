'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, apiPost } from '@/lib/api'
import { QK } from '@/lib/query-keys'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/get-error-message'

type SyncJobStatus = 'accepted' | 'running' | 'completed' | 'failed' | 'not_available'

export interface JobStatusResult {
  status: SyncJobStatus
  job_id?: string
  logs?: unknown[]
  error?: string | null
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useJobStatusQuery(
  jobId: string | null,
  options?: { enabled?: boolean; refetchInterval?: number | false }
) {
  return useQuery({
    queryKey: QK.jobStatus(jobId ?? ''),
    queryFn: async (): Promise<JobStatusResult> => {
      const data = await api<Record<string, unknown>>(
        `/api/v1/publishing/jobs/${jobId}`,
      )
      const inner = (data ?? {}) as Record<string, unknown>

      return {
        status: (inner.status as SyncJobStatus) ?? 'not_available',
        job_id: inner.job_id as string | undefined,
        logs: inner.logs as unknown[] | undefined,
        error: inner.error as string | null | undefined,
      }
    },
    enabled: !!jobId && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval ?? false,
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useSyncAllPostsMutation() {
  return useMutation({
    mutationFn: async () => {
      const data = await apiPost<Record<string, unknown>>(
        '/api/v1/publishing/sync/posts/all',
        {},
      )
      const inner = (data ?? null) as Record<string, unknown> | null
      const jobId = inner?.job_id as string | undefined
      if (!jobId) throw new Error(`Could not read job_id from response`)
      return { jobId, status: (inner?.status as SyncJobStatus) ?? 'accepted' }
    },
    onSuccess: () => {
      toast.success('Post sync started')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to start post sync'))
    },
  })
}

export function useSyncAllDictionariesMutation() {
  return useMutation({
    mutationFn: async () => {
      const data = await apiPost<Record<string, unknown>>(
        '/api/v1/publishing/sync/dictionaries/all',
        {},
      )
      const inner = (data ?? null) as Record<string, unknown> | null
      const jobId = inner?.job_id as string | undefined
      if (!jobId) throw new Error(`Could not read job_id from response`)
      return { jobId, status: (inner?.status as SyncJobStatus) ?? 'accepted' }
    },
    onSuccess: () => {
      toast.success('Dictionary sync started')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to start dictionary sync'))
    },
  })
}
