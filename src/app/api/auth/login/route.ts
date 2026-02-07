import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { encode } from 'next-auth/jwt'

import { prisma } from '@/lib/prisma'

const USER_TYPE_MAP: Record<string, number> = {
  DEMO: 1,
  CLIENT: 2,
  AGENCY: 3,
  ADMINISTRATOR: 4,
}

const USER_TYPE_RULES: Record<number, string[]> = {
  1: [],
  2: ['view_own_data', 'manage_profile'],
  3: ['create_clients', 'view_reports'],
  4: ['admin', 'manage_users', 'access_all'],
}

const AUTH_SECRET = process.env.AUTH_SECRET || 'nordtools-dev-secret-change-in-production'
const SESSION_COOKIE = 'authjs.session-token'
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60 // 30 days

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = typeof body.email === 'string' ? body.email.trim() : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if (!email || !password) {
      return NextResponse.json({ detail: 'Email and password are required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true },
    })

    if (!user?.password) {
      return NextResponse.json({ detail: 'Invalid credentials' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json({ detail: 'Invalid credentials' }, { status: 401 })
    }

    const userType = USER_TYPE_MAP[user.userType] ?? 1

    // Create NextAuth-compatible encrypted JWE token
    const sessionToken = await encode({
      token: {
        id: String(user.id),
        email: user.email,
        name: user.name ?? user.email,
        userType,
        companyId: user.companyId,
        company: user.company
          ? { id: user.company.id, name: user.company.name }
          : null,
      },
      secret: AUTH_SECRET,
      salt: SESSION_COOKIE,
      maxAge: SESSION_MAX_AGE_SECONDS,
    })

    const res = NextResponse.json({
      user: {
        email: user.email ?? '',
        username: user.name ?? (user.email ? user.email.split('@')[0] : ''),
        user_type: userType,
        abilityRules: USER_TYPE_RULES[userType] ?? [],
        company: user.company
          ? { id: user.company.id, name: user.company.name }
          : null,
      },
    })

    // Set NextAuth session cookie (same name NextAuth uses)
    const secure = req.nextUrl.protocol === 'https:'

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

    // Django-compatible cookies for parity
    res.cookies.set('access', sessionToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure,
      maxAge: SESSION_MAX_AGE_SECONDS,
    })

    return res
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 })
  }
}
