import { NextRequest, NextResponse } from 'next/server'
import type { Session } from 'next-auth'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AppError, ForbiddenError, UnauthorizedError } from '@/server/api/errors'
import { error as errorResponse } from '@/server/api/response'
import { createRequestId } from '@/server/api/request-id'

export type SessionUser = NonNullable<Session['user']>

export type HandlerContext = {
  user: SessionUser | null
  companyId: number | null
  body: unknown
  params: Record<string, string | string[]>
  searchParams: URLSearchParams
  requestId: string
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
  // DELETE is included because the HTTP spec permits DELETE bodies and
  // several routes accept JSON payloads (e.g. bulk-delete endpoints).
  return (
    method === 'POST' ||
    method === 'PUT' ||
    method === 'PATCH' ||
    method === 'DELETE'
  )
}

function isLegacyAuroraPath(pathname: string): boolean {
  return pathname.startsWith('/api/aurora/') || pathname === '/api/aurora'
}

function applyStandardHeaders(res: NextResponse, req: NextRequest, requestId: string) {
  res.headers.set('x-request-id', requestId)

  if (isLegacyAuroraPath(req.nextUrl.pathname)) {
    res.headers.set('deprecation', 'true')
    res.headers.set('sunset', '2026-12-31T23:59:59Z')
    res.headers.set('link', '</docs/api-architecture.md>; rel="deprecation"')
  }

  return res
}

export function apiHandler(handler: RouteHandler, options: ApiHandlerOptions = {}) {
  return async (
    req: NextRequest,
    context: { params: Promise<Record<string, string | string[]>> },
  ): Promise<NextResponse> => {
    const requestId = req.headers.get('x-request-id') || createRequestId()

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

        const requestedCompanyHeader = req.headers.get('Company-ID')
        if (user.userType === 4 && requestedCompanyHeader) {
          const requestedCompanyId = Number(requestedCompanyHeader)
          if (Number.isInteger(requestedCompanyId) && requestedCompanyId > 0) {
            // Verify company exists before trusting the header
            const companyExists = await prisma.company.findUnique({
              where: { id: requestedCompanyId },
              select: { id: true },
            })
            if (companyExists) {
              companyId = requestedCompanyId
            }
            // If company doesn't exist, fall through to user's own companyId
          }
        }

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

      const response = await handler(
        {
          user,
          companyId,
          body,
          params,
          searchParams,
          requestId,
        },
        req,
      )

      return applyStandardHeaders(response, req, requestId)
    } catch (err) {
      if (err instanceof AppError) {
        const response = errorResponse(err.message, err.statusCode, err.details, {
          code: err.code,
          requestId,
        })
        return applyStandardHeaders(response, req, requestId)
      }

      console.error('Unhandled API error', { requestId, err })
      const response = errorResponse('Internal server error', 500, undefined, {
        code: 'INTERNAL_ERROR',
        requestId,
      })
      return applyStandardHeaders(response, req, requestId)
    }
  }
}
