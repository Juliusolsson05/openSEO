import { auth } from './auth'

export class AuthGuardError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'AuthGuardError'
    this.status = status
  }
}

export async function requireAuth() {
  const session = await auth()

  if (!session?.user) {
    throw new AuthGuardError('Unauthorized', 401)
  }

  return session
}

export async function requireCompany() {
  const session = await requireAuth()

  if (session.user.companyId === null || session.user.companyId === undefined) {
    throw new AuthGuardError('Company context is required', 403)
  }

  return session
}

export async function requireAdmin() {
  const session = await requireAuth()

  if (session.user.userType !== 4) {
    throw new AuthGuardError('Administrator access required', 403)
  }

  return session
}
