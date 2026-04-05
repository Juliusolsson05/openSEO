import { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import { ForbiddenError, ValidationError } from '@/server/api/errors'

type Client = Prisma.TransactionClient | typeof prisma

/**
 * Verify that every categoryId in the list belongs to the caller's company.
 *
 * Throws ForbiddenError (HTTP 403) if any id is missing from the database or
 * owned by a different company. ValidationError (400) is thrown if the input
 * contains non-positive or non-integer ids, which is a programmer error not a
 * security boundary.
 *
 * No-op when categoryIds is undefined or empty: callers can pass the raw
 * update payload without guarding the call themselves.
 */
export async function assertCategoryOwnership(
  client: Client,
  companyId: number,
  categoryIds: number[] | undefined,
): Promise<void> {
  if (!categoryIds || categoryIds.length === 0) return

  const unique = Array.from(new Set(categoryIds))
  if (unique.some((id) => !Number.isInteger(id) || id <= 0)) {
    throw new ValidationError('categoryIds must be positive integers')
  }

  const owned = await client.category.findMany({
    where: { id: { in: unique }, companyId },
    select: { id: true },
  })

  if (owned.length !== unique.length) {
    const ownedSet = new Set(owned.map((c) => c.id))
    const missing = unique.filter((id) => !ownedSet.has(id))
    throw new ForbiddenError(
      `Categories not found or not owned by company: ${missing.join(', ')}`,
    )
  }
}
