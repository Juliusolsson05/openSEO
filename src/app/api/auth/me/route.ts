import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { ABILITY_RULES_BY_TYPE } from '@/lib/constants/user'

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
