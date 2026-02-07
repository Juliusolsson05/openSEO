import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'

const ABILITY_RULES_BY_TYPE: Record<number, string[]> = {
  1: ['read:dashboard'],
  2: ['read:dashboard', 'read:reports'],
  3: ['read:dashboard', 'manage:campaigns', 'manage:reports'],
  4: ['manage:all'],
}

export const GET = apiHandler(async (ctx) => {
  if (!ctx.user) {
    return raw({ detail: 'Authentication required' }, 401)
  }

  return raw({
    user: {
      email: ctx.user.email ?? '',
      username: ctx.user.email?.split('@')[0] ?? '',
      user_type: ctx.user.userType,
      abilityRules: ABILITY_RULES_BY_TYPE[ctx.user.userType ?? 0] ?? [],
      company: ctx.user.company
        ? {
            id: Number(ctx.user.company.id),
            name: ctx.user.company.name,
          }
        : null,
    },
  })
})
