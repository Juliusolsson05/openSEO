/**
 * API client — port of useApi from Nuxt composable.
 * Wraps fetch with:
 *  - baseURL from env
 *  - credentials: 'include' (cookie auth)
 *  - optional Company-ID header from cookie
 */

import { getCookie } from 'cookies-next'

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'

interface ApiOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

interface ApiResponse<T> {
  data: T | null
  error: Error | null
}

export async function api<T = any>(
  url: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const baseUrl = getBaseUrl()

  // Optional Company-ID from cookie (session header injection also happens server-side)
  const companyId =
    (typeof window !== 'undefined' ? getCookie('companyId') : null) ?? null

  // Build query string from params
  let fullUrl = `${baseUrl}${url}`
  if (options.params) {
    const searchParams = new URLSearchParams()
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.set(key, String(value))
    })
    const qs = searchParams.toString()
    if (qs) fullUrl += `?${qs}`
  }

  const { params: _, ...fetchOptions } = options

  try {
    const res = await fetch(fullUrl, {
      credentials: 'include',
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...(companyId ? { 'Company-ID': String(companyId) } : {}),
        ...fetchOptions.headers,
      },
    })

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}))
      throw new Error(
        errorBody?.detail || errorBody?.message || `HTTP ${res.status}`
      )
    }

    const data = (await res.json()) as T
    return { data, error: null }
  } catch (e: any) {
    return { data: null, error: e }
  }
}

/**
 * POST with JSON body shorthand
 */
export function apiPost<T = any>(url: string, body: any, options: ApiOptions = {}) {
  return api<T>(url, {
    method: 'POST',
    body: JSON.stringify(body),
    ...options,
  })
}

/**
 * PUT with JSON body shorthand
 */
export function apiPut<T = any>(url: string, body: any, options: ApiOptions = {}) {
  return api<T>(url, {
    method: 'PUT',
    body: JSON.stringify(body),
    ...options,
  })
}

/**
 * DELETE shorthand
 */
export function apiDelete<T = any>(url: string, options: ApiOptions = {}) {
  return api<T>(url, {
    method: 'DELETE',
    ...options,
  })
}

/**
 * POST with FormData (for file uploads)
 */
export function apiPostForm<T = any>(url: string, formData: FormData) {
  const baseUrl = getBaseUrl()
  const companyId =
    (typeof window !== 'undefined' ? getCookie('companyId') : null) ?? null

  return fetch(`${baseUrl}${url}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      ...(companyId ? { 'Company-ID': String(companyId) } : {}),
    },
    body: formData,
  }).then(async (res) => {
    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}))
      throw new Error(errorBody?.detail || `HTTP ${res.status}`)
    }
    return res.json() as Promise<T>
  })
}
