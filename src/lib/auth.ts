import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import type { UserType as PrismaUserType } from '@prisma/client'

import { prisma } from './prisma'

/**
 * Map Prisma UserType enum → numeric user type (matching Django)
 */
const USER_TYPE_MAP: Record<PrismaUserType, number> = {
  DEMO: 1,
  CLIENT: 2,
  AGENCY: 3,
  ADMINISTRATOR: 4,
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET || 'nordtools-dev-secret-change-in-production',
  session: {
    strategy: 'jwt',
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
          include: { company: true },
        })

        if (!user?.password) {
          return null
        }

        const isValidPassword = await bcrypt.compare(password, user.password)

        if (!isValidPassword) {
          return null
        }

        return {
          id: String(user.id),
          email: user.email,
          name: user.name ?? user.email,
          userType: USER_TYPE_MAP[user.userType],
          companyId: user.companyId,
          company: user.company,
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
        token.company = user.company
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.userType = (token.userType as number | null) ?? null
        session.user.companyId = (token.companyId as number | null) ?? null
        session.user.company = (token.company as typeof session.user.company) ?? null
      }

      return session
    },
  },
  pages: {
    signIn: '/login',
  },
})
