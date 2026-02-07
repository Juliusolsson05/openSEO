import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'

const ABILITY_RULES_BY_TYPE: Record<number, string[]> = {
  1: [],
  2: ['view_own_data', 'manage_profile'],
  3: ['create_clients', 'view_reports'],
  4: ['admin', 'manage_users', 'access_all'],
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
