'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { QK } from '@/lib/query-keys'

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationFeedItem = {
  id: string
  title: string
  subtitle: string
  createdAt: string
  url: string
  level: 'info' | 'success' | 'warning'
}

export type GlobalSearchItem = {
  id: string
  type: 'post' | 'title' | 'dictionary' | 'product'
  title: string
  subtitle?: string
  url: string
  updatedAt: string
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useNotificationsQuery(options?: { refetchInterval?: number | false }) {
  return useQuery({
    queryKey: QK.notifications(),
    queryFn: async () => {
      const data = await api<NotificationFeedItem[]>('/api/v1/notifications')
      return data ?? []
    },
    refetchInterval: options?.refetchInterval ?? 30000,
  })
}

export function useGlobalSearchQuery(
  q: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: QK.globalSearch(q),
    queryFn: async () => {
      const data = await api<GlobalSearchItem[]>('/api/v1/search/global', {
        params: { q },
      })
      return data ?? []
    },
    enabled: !!q.trim() && (options?.enabled ?? true),
    staleTime: 0, // always fresh search results
  })
}
