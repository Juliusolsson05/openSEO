import { z } from 'zod'

import { vault, VAULT_KEY_CATALOG } from '@/lib/vault'
import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { success } from '@/server/api/response'
import { listIntegrationSettings } from '@/server/setup'
import { validate } from '@/server/api/validate'

const upsertSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
})

export const GET = apiHandler(async () => {
  const rows = await listIntegrationSettings()
  return success(rows)
}, { admin: true })

export const POST = apiHandler(async ({ body }) => {
  const { key, value } = validate(upsertSchema, body)
  if (!(key in VAULT_KEY_CATALOG)) {
    throw new ValidationError('Unknown integration key')
  }

  await vault.set(key, value)
  const rows = await listIntegrationSettings()
  const item = rows.find((row) => row.key === key)
  if (!item) throw new ValidationError('Failed to load saved integration')
  return success(item)
}, { admin: true })
