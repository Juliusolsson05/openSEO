import { z } from 'zod'

import { VAULT_KEY_CATALOG, vault } from '@/lib/vault'
import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { success } from '@/server/api/response'

const paramsSchema = z.object({
  key: z.string().min(1),
})

export const DELETE = apiHandler(async ({ params }) => {
  const parsed = paramsSchema.safeParse(params)
  if (!parsed.success) throw new ValidationError('Invalid integration key')

  const key = decodeURIComponent(parsed.data.key)
  if (!(key in VAULT_KEY_CATALOG)) {
    throw new ValidationError('Unknown integration key')
  }

  await vault.delete(key)
  return success({ deleted: true, key })
}, { admin: true })
