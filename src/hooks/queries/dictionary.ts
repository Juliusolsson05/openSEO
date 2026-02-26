'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, apiPost, apiPut, apiDelete } from '@/lib/api'
import { QK } from '@/lib/query-keys'
import { toast } from 'sonner'
import type { DashboardDictionary as Dictionary, DashboardWord } from '@/types/dictionary'

interface ListDictionariesArg {
  searchQuery?: string
  itemsPerPage?: number
  page?: number
  sortBy?: string
  orderBy?: string
}

interface ListDictionariesResult {
  dictionaries: Dictionary[]
  total: number
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useDictionariesQuery(
  {
    searchQuery = '',
    itemsPerPage = 10,
    page = 1,
    sortBy,
    orderBy,
  }: ListDictionariesArg = {}
) {
  const filters = { searchQuery, itemsPerPage, page, sortBy, orderBy }
  return useQuery({
    queryKey: QK.dictionaries(filters),
    queryFn: async () => {
      const params: Record<string, string | number | undefined> = {
        q: searchQuery,
        itemsPerPage,
        page,
        sortBy,
        orderBy,
      }
      const { data, error } = await api<ListDictionariesResult>(
        '/api/aurora/dictionary/dictionaries',
        { params }
      )
      if (error) throw error
      return data!
    },
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useDeleteDictionaryMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (dictionaryId: number) => {
      const { data, error } = await apiPost(
        '/api/aurora/dictionary/dictionary/words/delete',
        { dictionary_id: dictionaryId }
      )
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dictionaries'] })
      toast.success('Dictionary deleted')
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete dictionary')
    },
  })
}

// ─── Single dictionary hook ──────────────────────────────────────────────────

export function useDictionaryQuery(id: number | string | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['dictionary', String(id)],
    queryFn: async () => {
      const { data, error } = await api<Dictionary>(`/api/aurora/dictionary/dictionary/${id}`)
      if (error) throw error
      return data!
    },
    enabled: !!id && (options?.enabled ?? true),
  })
}

// ─── Additional dictionary mutations ─────────────────────────────────────────

export function useGenerateDefinitionsMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { dictionary_id: number; word_ids?: number[] }) => {
      const { data, error } = await apiPost(
        '/api/aurora/dictionary/generation/definition/generate/',
        payload
      )
      if (error) throw error
      return data
    },
    onSuccess: (_d, { dictionary_id }) => {
      qc.invalidateQueries({ queryKey: ['dictionary', String(dictionary_id)] })
      toast.success('Definitions generated')
    },
    onError: (err: any) => { toast.error(err?.message || 'Failed to generate definitions') },
  })
}

export function useUpdateWordMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      wordId,
      dictionaryId,
      patch,
    }: { wordId: number; dictionaryId: number; patch: object }) => {
      const { data, error } = await apiPut(`/api/aurora/dictionary/modify/word/${wordId}`, patch)
      if (error) throw error
      return data
    },
    onSuccess: (_d, { dictionaryId }) => {
      qc.invalidateQueries({ queryKey: ['dictionary', String(dictionaryId)] })
    },
    onError: (err: any) => { toast.error(err?.message || 'Failed to update word') },
  })
}

export function usePublishDictionaryMutation() {
  return useMutation({
    mutationFn: async ({ dictionaryId }: { dictionaryId: number }) => {
      const { data, error } = await apiPost('/api/v1/publishing/sync/dictionaries/one', {
        dictionary_id: dictionaryId,
      })
      if (error) throw error
      return data
    },
    onSuccess: () => { toast.success('Dictionary published') },
    onError: (err: any) => { toast.error(err?.message || 'Failed to publish dictionary') },
  })
}

export function useExportDictionaryMutation() {
  return useMutation({
    mutationFn: async ({
      dictionaryId,
      format = 'json',
    }: { dictionaryId: number; format?: string }) => {
      const { data, error } = await apiPost<{ download_url?: string; url?: string }>(
        '/api/aurora/dictionary/dictionary/export/all/',
        { dictionary_id: dictionaryId, format }
      )
      if (error) throw error
      return data
    },
    onError: (err: any) => { toast.error(err?.message || 'Failed to export dictionary') },
  })
}

export function useDeleteWordMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      wordId,
      dictionaryId,
    }: { wordId: number; dictionaryId: number }) => {
      const { data, error } = await apiDelete(`/api/aurora/dictionary/modify/word/${wordId}`)
      if (error) throw error
      return data
    },
    onSuccess: (_d, { dictionaryId }) => {
      qc.invalidateQueries({ queryKey: ['dictionary', String(dictionaryId)] })
      toast.success('Word deleted')
    },
    onError: (err: any) => { toast.error(err?.message || 'Failed to delete word') },
  })
}


export function useWordDefinitionQuery(
  dictionaryId: string | undefined,
  wordId: string | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['dictionary', dictionaryId, 'word', wordId],
    queryFn: async () => {
      const { data, error } = await api<DashboardWord>(
        `/api/aurora/dictionary/dictionary/${dictionaryId}/word/${wordId}/`
      )
      if (error) throw error
      return data!
    },
    enabled: !!dictionaryId && !!wordId && (options?.enabled ?? true),
  })
}
