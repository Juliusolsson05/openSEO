import { NextRequest, NextResponse } from 'next/server'
import type { Session } from 'next-auth'

import { auth } from '@/lib/auth'
import { AppError, ForbiddenError, UnauthorizedError } from '@/server/api/errors'
import { error as errorResponse } from '@/server/api/response'

export type SessionUser = NonNullable<Session['user']>

export type HandlerContext = {
  user: SessionUser | null
  companyId: number | null
  body: unknown
  params: Record<string, string | string[]>
  searchParams: URLSearchParams
}

type RouteHandler = (
  ctx: HandlerContext,
  req: NextRequest,
) => Promise<NextResponse> | NextResponse

type ApiHandlerOptions = {
  auth?: boolean
  admin?: boolean
}

function isBodyMethod(method: string): boolean {
  return method === 'POST' || method === 'PUT' || method === 'PATCH'
}

export function apiHandler(handler: RouteHandler, options: ApiHandlerOptions = {}) {
  return async (
    req: NextRequest,
    context: { params: Promise<Record<string, string | string[]>> },
  ): Promise<NextResponse> => {
    try {
      const requireAuth = options.auth !== false

      let user: SessionUser | null = null
      let companyId: number | null = null

      if (requireAuth) {
        const session = await auth()

        if (!session?.user) {
          throw new UnauthorizedError('Authentication required')
        }

        user = session.user
        companyId = user.companyId ?? null

        if (companyId === null) {
          throw new ForbiddenError('User is not associated with a company')
        }

        if (options.admin && user.userType !== 4) {
          throw new ForbiddenError('Admin privileges required')
        }
      }

      const params = await context.params
      const searchParams = req.nextUrl.searchParams

      let body: unknown = undefined
      if (isBodyMethod(req.method)) {
        const contentType = req.headers.get('content-type')

        if (contentType?.includes('application/json')) {
          body = await req.json()
        } else if (contentType?.includes('application/x-www-form-urlencoded')) {
          body = Object.fromEntries((await req.formData()).entries())
        } else if (contentType?.includes('multipart/form-data')) {
          body = await req.formData()
        } else {
          body = await req.text()
        }
      }

      return await handler(
        {
          user,
          companyId,
          body,
          params,
          searchParams,
        },
        req,
      )
    } catch (err) {
      if (err instanceof AppError) {
        return errorResponse(err.message, err.statusCode, err.details)
      }

      console.error('Unhandled API error', err)
      return errorResponse('Internal server error', 500)
    }
  }
}
