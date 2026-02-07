/**
 * Prisma client for the example site's SQLite database.
 *
 * Completely separate from the main Aurora Prisma client.
 * Uses a different schema, different database, different generated client.
 */
import { PrismaClient } from '@/generated/example-client'

const globalForPrisma = globalThis as unknown as { examplePrisma: PrismaClient | undefined }

export const exampleDb = globalForPrisma.examplePrisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.examplePrisma = exampleDb
