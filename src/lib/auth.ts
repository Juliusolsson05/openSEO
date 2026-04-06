import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'

import { prisma } from './prisma'
import { USER_TYPE_MAP, SESSION_MAX_AGE_SECONDS } from './constants/user'
import type { SessionCompany } from '@/types/next-auth'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? (() => {
    if (process.env.NODE_ENV === 'production') throw new Error('AUTH_SECRET must be set in production')
    return 'openseo-dev-secret-do-not-use-in-production'
  })(),
  session: {
    strategy: 'jwt',
    maxAge: SESSION_MAX_AGE_SECONDS,
    updateAge: 24 * 60 * 60,
  },
  jwt: {
    maxAge: SESSION_MAX_AGE_SECONDS,
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email
        const password = credentials?.password

        if (typeof email !== 'string' || typeof password !== 'string') {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email },
          // Select ONLY the fields we need. Never include the full company row
          // here — sensitive fields (api_key, settings, metadata, profile) must
          // be fetched server-side on demand via ctx.companyId, not stored on
          // the JWT/session.
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            userType: true,
            companyId: true,
            company: {
              select: {
                id: true,
                name: true,
                language: true,
              },
            },
          },
        })

        if (!user?.password) {
          return null
        }

        const isValidPassword = await bcrypt.compare(password, user.password)

        if (!isValidPassword) {
          return null
        }

        const safeCompany: SessionCompany | null = user.company
          ? { id: user.company.id, name: user.company.name, language: user.company.language }
          : null

        return {
          id: String(user.id),
          email: user.email,
          name: user.name ?? user.email,
          userType: USER_TYPE_MAP[user.userType],
          companyId: user.companyId,
          company: safeCompany,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.userType = user.userType ?? null
        token.companyId = user.companyId ?? null
        // Re-project defensively: even if `user` was widened upstream, we only
        // ever persist the safe projection on the token.
        token.company = user.company
          ? {
              id: user.company.id,
              name: user.company.name,
              language: user.company.language,
            }
          : null
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.userType = (token.userType as number | null) ?? null
        session.user.companyId = (token.companyId as number | null) ?? null
        session.user.company = (token.company as SessionCompany | null) ?? null
      }

      return session
    },
  },
  pages: {
    signIn: '/login',
  },
})
