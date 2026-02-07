import { z } from 'zod'

import { prisma } from '@/lib/prisma'
import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { success } from '@/server/api/response'
import { createApiKey } from '@/server/publishing/auth'

const createSchema = z.object({
  name: z.string().trim().min(3).max(120),
})

export const GET = apiHandler(async ({ companyId }) => {
  if (!companyId) throw new ValidationError('Missing company ID in session')

  const rows = await prisma.publishingApiKey.findMany({
    where: { companyId },
    orderBy: { created_at: 'desc' },
    select: {
      id: true,
      name: true,
      key_prefix: true,
      is_active: true,
      created_at: true,
      last_used_at: true,
      revoked_at: true,
    },
  })

  return success(rows)
})

export const POST = apiHandler(async ({ companyId, body }) => {
  if (!companyId) throw new ValidationError('Missing company ID in session')

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) throw new ValidationError('Invalid payload')

  const generated = createApiKey()

  const row = await prisma.publishingApiKey.create({
    data: {
      companyId,
      name: parsed.data.name,
      key_prefix: generated.prefix,
      key_hash: generated.hash,
    },
    select: {
      id: true,
      name: true,
      key_prefix: true,
      created_at: true,
    },
  })

  return success({
    ...row,
    key: generated.raw,
    warning: 'Store this key now. It will not be shown again.',
  }, 201)
})
