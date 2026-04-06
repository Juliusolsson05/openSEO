import { z } from 'zod'

import { VAULT_KEY_CATALOG, vault } from '@/lib/vault'
import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { success } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { enforceRateLimit, RATE_LIMIT_BUCKETS } from '@/server/api/rate-limit'

const schema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
})

export const POST = apiHandler(async ({ body }, req) => {
  enforceRateLimit(req, RATE_LIMIT_BUCKETS.setup)

  const { key, value } = validate(schema, body)
  if (!(key in VAULT_KEY_CATALOG)) {
    throw new ValidationError('Unknown integration key')
  }

  return success(await vault.test(key, value))
}, { auth: false })
