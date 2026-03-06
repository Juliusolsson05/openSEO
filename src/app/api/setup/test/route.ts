import { z } from 'zod'

import { VAULT_KEY_CATALOG, vault } from '@/lib/vault'
import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { success } from '@/server/api/response'
import { validate } from '@/server/api/validate'

const schema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
})

export const POST = apiHandler(async ({ body }) => {
  const { key, value } = validate(schema, body)
  if (!(key in VAULT_KEY_CATALOG)) {
    throw new ValidationError('Unknown integration key')
  }

  return success(await vault.test(key, value))
}, { auth: false })
