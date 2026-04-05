'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, apiPost } from '@/lib/api'
import { QK } from '@/lib/query-keys'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/get-error-message'

export type CompanyListItem = { id: number; name: string }
export type InviteItem = { id: string; email: string | null }

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useCompaniesQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QK.companies(),
    queryFn: async () => {
      const data = await api<
        { companies: CompanyListItem[] } | CompanyListItem[]
      >('/api/admin/companies')
      return Array.isArray(data) ? data : (data?.companies ?? [])
    },
    enabled: options?.enabled ?? true,
  })
}

export function useUsersQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QK.users(),
    queryFn: async () => {
      const data = await api<{ data: InviteItem[] }>('/api/admin/users')
      return data?.data ?? []
    },
    enabled: options?.enabled ?? true,
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useApproveUserEmailMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ email }: { email: string }) =>
      apiPost('/api/admin/users', { email }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.users() })
      toast.success('Email approved for signup')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to approve email'))
    },
  })
}
