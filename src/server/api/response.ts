import { NextResponse } from 'next/server'

export type ApiSuccessResponse<T> = {
  success: true
  data: T
}

export type ApiErrorResponse = {
  success: false
  error: {
    message: string
    details?: unknown
  }
}

export function success<T>(data: T, status = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ success: true, data }, { status })
}

export function error(message: string, status: number, details?: unknown): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        ...(details !== undefined ? { details } : {}),
      },
    },
    { status },
  )
}

export function paginated<T>(data: T[], total: number, page: number, pageSize: number): NextResponse {
  const totalPages = Math.ceil(total / pageSize)

  return success({
    items: data,
    pagination: {
      total,
      page,
      pageSize,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  })
}
