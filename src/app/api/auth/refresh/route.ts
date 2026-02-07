import { auth } from '@/lib/auth'
import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'

export const POST = apiHandler(
  async () => {
    const session = await auth()
    if (!session?.user) {
      return raw({ detail: 'Missing refresh token' }, 401)
    }

    return raw({ ok: true })
  },
  { auth: false },
)
