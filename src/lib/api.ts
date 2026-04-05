/**
 * API client — port of useApi from Nuxt composable.
 *
 * ENVELOPE CONTRACT
 * -----------------
 * api() automatically unwraps {success: true, data: X} envelope responses.
 * Callers always receive raw data in `{ data, error }`. Route handlers may
 * return an envelope (via `success()` from @/server/api/response) OR a raw
 * payload (via `raw()` / `NextResponse.json`); both work transparently for
 * any consumer of api(), apiPost(), apiPut(), apiPatch(), apiDelete(), and
 * apiPostForm(). This file is the single enforcement point — do not reinstate
 * per-hook unwrapping.
 *
 * Unwrap rule: a response body is considered an envelope iff it is a non-null
 * plain object with `success === true` AND an own `data` property. Objects
 * that merely carry a `success` flag without a `data` sibling are passed
 * through untouched.
 *
 * Wraps fetch with:
 *  - baseURL from env
 *  - credentials: 'include' (cookie auth)
 *  - optional Company-ID header from cookie
 */

import { getCookie } from 'cookies-next'

import type { ApiOptions, ApiResponse } from '@/types/api'

const getBaseUrl = () => {
  // In the browser, always use relative URLs so the request goes to the
  // same origin the page was loaded from (works on LAN, localhost, etc.)
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_BASE_URL || ''
  }
  // Server-side (SSR / RSC) needs an absolute URL
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4720'
}

/**
 * Strip the {success: true, data: X} envelope if present, otherwise return
 * the body unchanged. Exported for tests; not intended for direct use.
 */
export function unwrapEnvelope<T>(body: unknown): T {
  if (
    body !== null &&
    typeof body === 'object' &&
    !Array.isArray(body) &&
    (body as Record<string, unknown>).success === true &&
    Object.prototype.hasOwnProperty.call(body, 'data')
  ) {
    return (body as { data: T }).data
  }
  return body as T
}

export async function api<T = any>(
  url: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const baseUrl = getBaseUrl()

  // Optional Company-ID from cookie (session header injection also happens server-side)
  const companyId =
    (typeof window !== 'undefined' ? getCookie('companyId') : null) ?? null

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

    const body = await res.json()
    const data = unwrapEnvelope<T>(body)
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
 * PATCH with JSON body shorthand
 */
export function apiPatch<T = any>(url: string, body: any, options: ApiOptions = {}) {
  return api<T>(url, {
    method: 'PATCH',
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
    const body = await res.json()
    return unwrapEnvelope<T>(body)
  })
}
