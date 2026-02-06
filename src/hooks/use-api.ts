/**
 * React Query wrapper around the api client.
 * Provides useApiQuery / useApiMutation for components.
 */

import { useQuery, useMutation, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query'
import { api, apiPost, apiPut, apiDelete } from '@/lib/api'

/**
 * GET query hook — wraps api() with React Query caching.
 */
export function useApiQuery<T = any>(
  key: string[],
  url: string,
  params?: Record<string, string | number | boolean | undefined>,
  options?: Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T, Error>({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await api<T>(url, { params })
      if (error) throw error
      return data as T
    },
    ...options,
  })
}

/**
 * POST mutation hook.
 */
export function useApiPostMutation<T = any, V = any>(
  url: string,
  options?: UseMutationOptions<T, Error, V>
) {
  return useMutation<T, Error, V>({
    mutationFn: async (body: V) => {
      const { data, error } = await apiPost<T>(url, body)
      if (error) throw error
      return data as T
    },
    ...options,
  })
}

/**
 * PUT mutation hook.
 */
export function useApiPutMutation<T = any, V = any>(
  url: string,
  options?: UseMutationOptions<T, Error, V>
) {
  return useMutation<T, Error, V>({
    mutationFn: async (body: V) => {
      const { data, error } = await apiPut<T>(url, body)
      if (error) throw error
      return data as T
    },
    ...options,
  })
}

/**
 * DELETE mutation hook.
 */
export function useApiDeleteMutation<T = any>(
  url: string,
  options?: UseMutationOptions<T, Error, void>
) {
  return useMutation<T, Error, void>({
    mutationFn: async () => {
      const { data, error } = await apiDelete<T>(url)
      if (error) throw error
      return data as T
    },
    ...options,
  })
}
