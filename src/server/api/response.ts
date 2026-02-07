import { NextResponse } from 'next/server'

export type ApiMeta = {
  requestId?: string
  timestamp?: string
}

export type ApiSuccessResponse<T> = {
  success: true
  data: T
  meta?: ApiMeta
}

export type ApiProblem = {
  type?: string
  title?: string
  status: number
  code?: string
  detail: string
  requestId?: string
  details?: unknown
}

export type ApiErrorResponse = {
  success: false
  error: ApiProblem
}

export function success<T>(data: T, status = 200, meta?: ApiMeta): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta ? { meta: { timestamp: new Date().toISOString(), ...meta } } : {}),
    },
    { status },
  )
}

export function raw<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status })
}

export function error(
  message: string,
  status: number,
  details?: unknown,
  options?: { code?: string; type?: string; title?: string; requestId?: string },
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      // Legacy compatibility fields
      detail: message,
      message,

      // Standard envelope fields
      success: false,
      error: {
        status,
        detail: message,
        ...(options?.code ? { code: options.code } : {}),
        ...(options?.type ? { type: options.type } : {}),
        ...(options?.title ? { title: options.title } : {}),
        ...(options?.requestId ? { requestId: options.requestId } : {}),
        ...(details !== undefined ? { details } : {}),
      },
    },
    { status },
  )
}

export function paginated<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number,
  meta?: ApiMeta,
): NextResponse {
  const totalPages = Math.ceil(total / pageSize)

  return success(
    {
      items: data,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    },
    200,
    meta,
  )
}
