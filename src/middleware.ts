import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'

const PUBLIC_PATHS = ['/', '/login', '/register', '/forgot-password']
const PUBLIC_PREFIXES = ['/api/', '/preview/', '/share/', '/app']

export default auth((req) => {
  const { pathname } = req.nextUrl

  const isPublicPath =
    pathname.startsWith('/api/auth') ||
    PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`)) ||
    PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix))

  if (isPublicPath) {
    return NextResponse.next()
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
