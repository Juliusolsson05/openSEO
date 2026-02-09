/** Options for the fetch-based API client. */
export interface ApiOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

/** Standard API response wrapper. */
export interface ApiResponse<T> {
  data: T | null
  error: Error | null
}

/** Metadata attached to API success responses. */
export interface ApiMeta {
  requestId?: string
  timestamp?: string
}

/** Structured API error body. */
export interface ApiProblem {
  type?: string
  title?: string
  status: number
  code?: string
  detail: string
  requestId?: string
  details?: unknown
}

/** Envelope for successful API responses. */
export interface ApiSuccessResponse<T> {
  success: true
  data: T
  meta?: ApiMeta
}

/** Envelope for failed API responses. */
export interface ApiErrorResponse {
  success: false
  error: ApiProblem
}
