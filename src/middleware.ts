import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'

// Paths that do not require an authenticated session (no redirect to /login).
// API routes authenticate themselves inside their handlers.
const PUBLIC_PATHS = ['/', '/login', '/register', '/forgot-password', '/setup']
const AUTH_EXEMPT_PREFIXES = ['/api/', '/preview/', '/share/', '/example', '/site']

// Paths where we should NOT mutate request headers with the resolved Company-ID.
// These are fully public surfaces with no notion of a "current company" for the viewer.
const HEADER_INJECTION_EXEMPT_PREFIXES = ['/preview/', '/share/', '/example', '/site']

const matchesPrefix = (pathname: string, prefixes: readonly string[]) =>
  prefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix))

export default auth((req) => {
  const { pathname } = req.nextUrl

  // NextAuth's own endpoints: never touch.
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  const isAuthExempt =
    PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`)) ||
    matchesPrefix(pathname, AUTH_EXEMPT_PREFIXES)

  // If the request requires auth and the user is not signed in, let next-auth's
  // default behaviour (via the `auth()` wrapper) redirect. We only reach the
  // code below when either the path is auth-exempt OR the user is authenticated.
  if (!isAuthExempt && !req.auth?.user) {
    return NextResponse.next()
  }

  // Skip header injection entirely for fully-public surfaces.
  if (matchesPrefix(pathname, HEADER_INJECTION_EXEMPT_PREFIXES)) {
    return NextResponse.next()
  }

  // Resolve Company-ID: session default, overridden by admin cookie.
  const headers = new Headers(req.headers)
  let companyId = req.auth?.user?.companyId ?? null

  if (req.auth?.user?.userType === 4) {
    const cookieValue = req.cookies.get('companyId')?.value
    if (cookieValue) {
      const cookieCompanyId = Number(cookieValue)
      if (Number.isInteger(cookieCompanyId) && cookieCompanyId > 0) {
        companyId = cookieCompanyId
      }
    }
  }

  if (companyId !== null && companyId !== undefined) {
    headers.set('Company-ID', String(companyId))
  }

  return NextResponse.next({
    request: {
      headers,
    },
  })
})

export const runtime = 'nodejs'

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
