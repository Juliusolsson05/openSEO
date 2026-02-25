'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, apiPost } from '@/lib/api'
import { QK } from '@/lib/query-keys'
import { toast } from 'sonner'

export type CompanyListItem = { id: number; name: string }
export type InviteItem = { id: string; email: string | null }

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useCompaniesQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QK.companies(),
    queryFn: async () => {
      const { data, error } = await api<
        { companies: CompanyListItem[] } | CompanyListItem[]
      >('/api/admin/companies')
      if (error) throw error
      return Array.isArray(data) ? data : (data?.companies ?? [])
    },
    enabled: options?.enabled ?? true,
  })
}

export function useUsersQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QK.users(),
    queryFn: async () => {
      const { data, error } = await api<{ data: InviteItem[] }>(
        '/api/admin/users'
      )
      if (error) throw error
      return data?.data ?? []
    },
    enabled: options?.enabled ?? true,
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useApproveUserEmailMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const { data, error } = await apiPost('/api/admin/users', { email })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.users() })
      toast.success('Email approved for signup')
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to approve email')
    },
  })
}
