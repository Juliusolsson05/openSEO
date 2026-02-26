import type { UserType as PrismaUserType } from '@prisma/client'

/**
 * Maps Prisma UserType enum → numeric user type (matches legacy Django parity).
 * Single source of truth — imported by lib/auth.ts, login route, and me route.
 */
export const USER_TYPE_MAP: Record<PrismaUserType, number> = {
  DEMO: 1,
  CLIENT: 2,
  AGENCY: 3,
  ADMINISTRATOR: 4,
}

/**
 * Ability rules granted per user type.
 * Used in /api/auth/me and /api/auth/login responses.
 */
export const ABILITY_RULES_BY_TYPE: Record<number, string[]> = {
  1: [],
  2: ['view_own_data', 'manage_profile'],
  3: ['create_clients', 'view_reports'],
  4: ['admin', 'manage_users', 'access_all'],
}

/** NextAuth session cookie name */
export const SESSION_COOKIE = 'authjs.session-token' as const

/** Session lifetime — 30 days in seconds */
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60
