import { z } from 'zod'

import { prisma } from '@/lib/prisma'
import { apiHandler } from '@/server/api/handler'
import { ValidationError } from '@/server/api/errors'
import { success } from '@/server/api/response'

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export const POST = apiHandler(async ({ companyId, params }) => {
  if (!companyId) throw new ValidationError('Missing company ID in session')

  const parsed = paramsSchema.safeParse(params)
  if (!parsed.success) throw new ValidationError('Invalid key ID')

  const key = await prisma.publishingApiKey.findFirst({
    where: { id: parsed.data.id, companyId },
    select: { id: true },
  })

  if (!key) throw new ValidationError('API key not found')

  await prisma.publishingApiKey.update({
    where: { id: key.id },
    data: {
      is_active: false,
      revoked_at: new Date(),
    },
  })

  return success({ revoked: true })
})
