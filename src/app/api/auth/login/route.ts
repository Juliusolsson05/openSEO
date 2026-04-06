import bcrypt from 'bcryptjs'
import { encode } from 'next-auth/jwt'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'
import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { UnauthorizedError } from '@/server/api/errors'
import { validate } from '@/server/api/validate'
import {
  USER_TYPE_MAP,
  ABILITY_RULES_BY_TYPE,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from '@/lib/constants/user'

const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
})

export const POST = apiHandler(
  async (ctx, req) => {
    const { email, password } = validate(loginSchema, ctx.body)

    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true },
    })

    if (!user?.password) throw new UnauthorizedError('Invalid credentials')

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) throw new UnauthorizedError('Invalid credentials')

    const authSecret = process.env.AUTH_SECRET ?? (() => {
      if (process.env.NODE_ENV === 'production') throw new Error('AUTH_SECRET must be set in production')
      return 'openseo-dev-secret-do-not-use-in-production'
    })()

    const userType = USER_TYPE_MAP[user.userType] ?? 1

    const sessionToken = await encode({
      token: {
        id: String(user.id),
        email: user.email,
        name: user.name ?? user.email,
        userType,
        companyId: user.companyId,
        company: user.company
          ? { id: user.company.id, name: user.company.name, language: user.company.language }
          : null,
      },
      secret: authSecret,
      salt: SESSION_COOKIE,
      maxAge: SESSION_MAX_AGE_SECONDS,
    })

    const res = raw({
      user: {
        email: user.email ?? '',
        username: user.name ?? (user.email ? user.email.split('@')[0] : ''),
        user_type: userType,
        abilityRules: ABILITY_RULES_BY_TYPE[userType] ?? [],
        company: user.company
          ? { id: user.company.id, name: user.company.name, language: user.company.language }
          : null,
      },
    })

    // In production we always want Secure cookies. We cannot rely on
    // req.nextUrl.protocol because TLS-terminating proxies (nginx,
    // Cloudflare, ALB, etc.) forward plaintext http: to the app even
    // though the client-facing connection is https:. NODE_ENV is the
    // simplest reliable signal; dev (localhost) keeps Secure=false so
    // cookies still work over http://localhost.
    const secure = process.env.NODE_ENV === 'production'

    res.cookies.set(SESSION_COOKIE, sessionToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure,
      maxAge: SESSION_MAX_AGE_SECONDS,
    })

    if (secure) {
      res.cookies.set(`__Secure-${SESSION_COOKIE}`, sessionToken, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        maxAge: SESSION_MAX_AGE_SECONDS,
      })
    }

    return res
  },
  { auth: false },
)
