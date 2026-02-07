import bcrypt from 'bcryptjs'

import { prisma } from '@/lib/prisma'
import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'

const USER_TYPE_RULES: Record<string, string[]> = {
  DEMO: ['read:dashboard'],
  CLIENT: ['read:dashboard', 'read:reports'],
  AGENCY: ['read:dashboard', 'manage:campaigns', 'manage:reports'],
  ADMINISTRATOR: ['manage:all'],
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

    return raw({
      user: {
        email: userEmail,
        username: userEmail.split('@')[0] ?? userEmail,
        user_type: user.userType,
        abilityRules: USER_TYPE_RULES[user.userType] ?? [],
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
