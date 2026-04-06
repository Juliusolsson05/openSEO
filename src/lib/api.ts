/**
 * API client — port of useApi from Nuxt composable.
 *
 * ERROR CONTRACT
 * --------------
 * api() REJECTS on HTTP errors and network failures. Callers should await
 * it and let React Query / try-catch handle rejection — DO NOT destructure
 * `{ data, error }`. The old `{ data, error }` shape is gone. React Query's
 * `useQuery({ queryFn: async () => api(...) })` handles rejection as
 * `isError`, and a resolved value (including `null`, `[]`, or `undefined`)
 * as `isSuccess`.
 *
 * ENVELOPE CONTRACT
 * -----------------
 * api() automatically unwraps {success: true, data: X} envelope responses.
 * See unwrapEnvelope() below. Route handlers may return an envelope (via
 * `success()` from @/server/api/response) OR a raw payload (via `raw()`);
 * both work transparently for every consumer.
 *
 * This file is the single enforcement point for both contracts — do not
 * reinstate per-hook error guards or per-hook envelope unwrapping.
 *
 * Unwrap rule: a response body is considered an envelope iff it is a non-null
 * plain object with `success === true` AND an own `data` property. Objects
 * that merely carry a `success` flag without a `data` sibling are passed
 * through untouched.
 *
 * Wraps fetch with:
 *  - baseURL from env
 *  - credentials: 'same-origin' (cookie auth; 'include' only for cross-origin)
 *  - optional Company-ID header from cookie
 */

import { getCookie } from 'cookies-next'

import type { ApiOptions } from '@/types/api'

/**
 * Resolve the base URL for a fetch call.
 *
 * Precedence (server-side only — the browser always uses relative URLs):
 *   1. process.env.NEXT_PUBLIC_API_BASE_URL   (explicit override)
 *   2. process.env.NEXT_PUBLIC_APP_URL        (deployment public URL)
 *   3. Origin reconstructed from request headers via next/headers:
 *        `${x-forwarded-proto || 'https'}://${x-forwarded-host || host}`
 *   4. Throw — never silently fall back to localhost:4720.
 *
 * Step 3 only works inside an RSC render or route handler (i.e. a request
 * scope). Outside one, `headers()` throws and we fall through to step 4.
 */
async function getBaseUrl(): Promise<string> {
  if (typeof window !== 'undefined') {
    // In the browser, always use relative URLs so the request goes to the
    // same origin the page was loaded from (works on LAN, localhost, etc.)
    return process.env.NEXT_PUBLIC_API_BASE_URL || ''
  }

  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  try {
    // Lazy import so client bundles don't pull in next/headers.
    const { headers } = await import('next/headers')
    const h = await headers()
    const host = h.get('x-forwarded-host') ?? h.get('host')
    if (host) {
      const proto = h.get('x-forwarded-proto') ?? 'https'
      return `${proto}://${host}`
    }
  } catch {
    // Not in a request scope (e.g. background job, test harness) — fall through.
  }

  throw new Error(
    'api(): cannot resolve base URL for server-side request. ' +
      'Set NEXT_PUBLIC_API_BASE_URL or NEXT_PUBLIC_APP_URL, or call api() ' +
      'from inside a request scope (RSC / route handler).',
  )
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
): Promise<T> {
  const baseUrl = await getBaseUrl()

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

  // Same-origin when NEXT_PUBLIC_API_BASE_URL is unset (the browser default):
  // cookies flow to our own origin but will not leak on an accidental
  // cross-origin redirect. Fall back to 'include' only when the caller has
  // configured a cross-origin API base URL.
  const crossOrigin =
    typeof window !== 'undefined' &&
    !!process.env.NEXT_PUBLIC_API_BASE_URL &&
    !process.env.NEXT_PUBLIC_API_BASE_URL.startsWith(window.location.origin)
  const credentials: RequestCredentials = crossOrigin ? 'include' : 'same-origin'

  const res = await fetch(fullUrl, {
    credentials,
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
  return unwrapEnvelope<T>(body)
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
export async function apiPostForm<T = any>(
  url: string,
  formData: FormData,
): Promise<T> {
  const baseUrl = await getBaseUrl()
  const companyId =
    (typeof window !== 'undefined' ? getCookie('companyId') : null) ?? null

  const crossOrigin =
    typeof window !== 'undefined' &&
    !!process.env.NEXT_PUBLIC_API_BASE_URL &&
    !process.env.NEXT_PUBLIC_API_BASE_URL.startsWith(window.location.origin)
  const credentials: RequestCredentials = crossOrigin ? 'include' : 'same-origin'

  const res = await fetch(`${baseUrl}${url}`, {
    method: 'POST',
    credentials,
    headers: {
      ...(companyId ? { 'Company-ID': String(companyId) } : {}),
    },
    body: formData,
  })

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}))
    throw new Error(errorBody?.detail || `HTTP ${res.status}`)
  }

  const body = await res.json()
  return unwrapEnvelope<T>(body)
}
