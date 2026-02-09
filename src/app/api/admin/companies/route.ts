/**
 * GET /api/admin/companies
 *
 * Returns all companies. Admin only.
 */

import { prisma } from '@/lib/prisma'
import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'

export const GET = apiHandler(async () => {
  const companies = await prisma.company.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return raw({ companies })
}, { admin: true })
