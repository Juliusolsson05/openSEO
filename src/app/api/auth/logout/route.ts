import { SignJWT } from 'jose'

import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'

export const POST = apiHandler(
  async () => {
    const secret = process.env.AUTH_SECRET ?? 'openseo-dev-secret-do-not-use-in-production'
    const expired = await new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('0s').sign(new TextEncoder().encode(secret))

    const response = raw({ ok: true })
    response.cookies.set('authjs.session-token', expired, { path: '/', httpOnly: true, sameSite: 'lax', expires: new Date(0) })
    response.cookies.set('__Secure-authjs.session-token', expired, { path: '/', httpOnly: true, sameSite: 'lax', secure: true, expires: new Date(0) })
    response.cookies.set('next-auth.session-token', expired, { path: '/', httpOnly: true, sameSite: 'lax', expires: new Date(0) })
    response.cookies.set('__Secure-next-auth.session-token', expired, { path: '/', httpOnly: true, sameSite: 'lax', secure: true, expires: new Date(0) })
    response.cookies.set('access', '', { path: '/', httpOnly: true, sameSite: 'lax', expires: new Date(0) })
    return response
  },
  { auth: false },
)
