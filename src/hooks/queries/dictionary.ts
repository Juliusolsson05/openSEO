'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, apiPost, apiPut, apiDelete } from '@/lib/api'
import { QK } from '@/lib/query-keys'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/get-error-message'
import type { DashboardDictionary as Dictionary, DashboardWord } from '@/types/dictionary'

export type DictionaryStatusFilter = 'all' | 'active' | 'completed'

interface ListDictionariesArg {
  searchQuery?: string
  itemsPerPage?: number
  page?: number
  sortBy?: string
  orderBy?: string
  status?: DictionaryStatusFilter
}

interface ListDictionariesResult {
  dictionaries: Dictionary[]
  total: number
  inProgressTotal: number
  completedTotal: number
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useDictionariesQuery(
  {
    searchQuery = '',
    itemsPerPage = 10,
    page = 1,
    sortBy,
    orderBy,
    status = 'all',
  }: ListDictionariesArg = {}
) {
  const filters = { searchQuery, itemsPerPage, page, sortBy, orderBy, status }
  return useQuery({
    queryKey: QK.dictionaries(filters),
    queryFn: () => {
      const params: Record<string, string | number | undefined> = {
        q: searchQuery,
        itemsPerPage,
        page,
        sortBy,
        orderBy,
        status,
      }
      return api<ListDictionariesResult>(
        '/api/aurora/dictionary/dictionaries',
        { params },
      )
    },
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useDeleteDictionaryMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dictionaryId: number) =>
      apiDelete(`/api/aurora/dictionary/modify/${dictionaryId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dictionaries'] })
      toast.success('Dictionary deleted')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to delete dictionary'))
    },
  })
}

// ─── Single dictionary hook ──────────────────────────────────────────────────

export function useDictionaryQuery(id: number | string | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['dictionary', String(id)],
    queryFn: () => api<Dictionary>(`/api/aurora/dictionary/dictionary/${id}`),
    enabled: !!id && (options?.enabled ?? true),
  })
}

// ─── Additional dictionary mutations ─────────────────────────────────────────

export function useGenerateDefinitionsMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { dictionary_id: number; word_ids?: number[] }) =>
      apiPost(
        '/api/aurora/dictionary/generation/definition/generate/',
        payload,
      ),
    onSuccess: (_d, { dictionary_id }) => {
      qc.invalidateQueries({ queryKey: ['dictionary', String(dictionary_id)] })
      toast.success('Definitions generated')
    },
    onError: (err) => { toast.error(getErrorMessage(err, 'Failed to generate definitions')) },
  })
}

export function useUpdateWordMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      wordId,
      patch,
    }: { wordId: number; dictionaryId: number; patch: object }) =>
      apiPut(`/api/aurora/dictionary/modify/word/${wordId}`, patch),
    onSuccess: (_d, { dictionaryId }) => {
      qc.invalidateQueries({ queryKey: ['dictionary', String(dictionaryId)] })
    },
    onError: (err) => { toast.error(getErrorMessage(err, 'Failed to update word')) },
  })
}

export function usePublishDictionaryMutation() {
  return useMutation({
    mutationFn: ({ dictionaryId }: { dictionaryId: number }) =>
      apiPost('/api/v1/publishing/sync/dictionaries/one', {
        dictionary_id: dictionaryId,
      }),
    onSuccess: () => { toast.success('Dictionary published') },
    onError: (err) => { toast.error(getErrorMessage(err, 'Failed to publish dictionary')) },
  })
}

export function useExportDictionaryMutation() {
  return useMutation({
    mutationFn: ({
      dictionaryId,
      format = 'json',
    }: { dictionaryId: number; format?: string }) =>
      apiPost<{ download_url?: string; url?: string }>(
        '/api/aurora/dictionary/dictionary/export/all/',
        { dictionary_id: dictionaryId, format },
      ),
    onError: (err) => { toast.error(getErrorMessage(err, 'Failed to export dictionary')) },
  })
}

export function useDeleteWordMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      wordId,
    }: { wordId: number; dictionaryId: number }) =>
      apiDelete(`/api/aurora/dictionary/modify/word/${wordId}`),
    onSuccess: (_d, { dictionaryId }) => {
      qc.invalidateQueries({ queryKey: ['dictionary', String(dictionaryId)] })
      toast.success('Word deleted')
    },
    onError: (err) => { toast.error(getErrorMessage(err, 'Failed to delete word')) },
  })
}


export function useWordDefinitionQuery(
  dictionaryId: string | undefined,
  wordId: string | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['dictionary', dictionaryId, 'word', wordId],
    queryFn: () =>
      api<DashboardWord>(
        `/api/aurora/dictionary/dictionary/${dictionaryId}/word/${wordId}/`,
      ),
    enabled: !!dictionaryId && !!wordId && (options?.enabled ?? true),
  })
}
