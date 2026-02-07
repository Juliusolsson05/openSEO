import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password']

export default auth((req) => {
  const { pathname } = req.nextUrl

  if (
    pathname.startsWith('/api/auth') ||
    PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
  ) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/dashboard') && !req.auth?.user) {
    const loginUrl = new URL('/login', req.nextUrl.origin)
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.href)
    return NextResponse.redirect(loginUrl)
  }

  const headers = new Headers(req.headers)
  const companyId = req.auth?.user?.companyId

  if (companyId !== null && companyId !== undefined) {
    headers.set('Company-ID', String(companyId))
  }

  return NextResponse.next({
    request: {
      headers,
    },
  })
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
