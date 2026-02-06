/**
 * NextAuth v5 configuration — ported from server/api/auth/[...].ts
 * Credentials provider hitting the Django backend.
 */

import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://nordwebb-f6ed36c3f560.herokuapp.com'

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || 'nordtools-dev-secret-change-in-production',

  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const response = await fetch(`${BACKEND_URL}/api/auth/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          if (!response.ok) {
            console.error('Login failed:', response.status)
            return null
          }

          const data = await response.json()

          return {
            id: String(data.user?.id || data.id),
            email: data.user?.email || data.email || credentials.email,
            name: data.user?.name || data.name || String(credentials.email),
            accessToken: data.access_token || data.token,
            company: data.user?.company || null,
            abilityRules: data.user?.abilityRules || [],
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.accessToken = (user as any).accessToken
        token.company = (user as any).company
        token.abilityRules = (user as any).abilityRules
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.id
        ;(session.user as any).accessToken = token.accessToken
        ;(session.user as any).company = token.company
        ;(session.user as any).abilityRules = token.abilityRules
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
  },
})
