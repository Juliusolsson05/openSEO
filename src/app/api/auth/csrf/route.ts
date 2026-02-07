import { randomUUID } from 'crypto'

import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'

export const GET = apiHandler(
  async () => {
    return raw({ ok: true, csrfToken: randomUUID() })
  },
  { auth: false },
)
