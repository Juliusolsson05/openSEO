import bcrypt from 'bcryptjs'

import { prisma } from '@/lib/prisma'
import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'

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

export const POST = apiHandler(
  async (ctx) => {
    const body = (ctx.body ?? {}) as Record<string, unknown>
    const email = typeof body.email === 'string' ? body.email.trim() : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if (!email || !password) {
      return raw({ detail: 'Email and password are required' }, 400)
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true },
    })

    if (!user?.password) {
      return raw({ detail: 'Invalid credentials' }, 401)
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return raw({ detail: 'Invalid credentials' }, 401)
    }

    const userEmail = user.email ?? ''

    const userType = USER_TYPE_MAP[user.userType] ?? 1

    return raw({
      user: {
        email: userEmail,
        username: user.name ?? userEmail.split('@')[0] ?? userEmail,
        user_type: userType,
        abilityRules: USER_TYPE_RULES[userType] ?? [],
        company: user.company
          ? {
              id: user.company.id,
              name: user.company.name,
            }
          : null,
      },
    })
  },
  { auth: false },
)
