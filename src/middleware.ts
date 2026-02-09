import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'

const PUBLIC_PATHS = ['/', '/login', '/register', '/forgot-password']
const PUBLIC_PREFIXES = ['/api/', '/preview/', '/share/', '/app', '/landing', '/example', '/site']

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
  let companyId = req.auth?.user?.companyId ?? null

  // For admin users, prefer the companyId cookie (set by company picker)
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

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
