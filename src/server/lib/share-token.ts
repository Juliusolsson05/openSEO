import { randomBytes } from 'node:crypto'

/**
 * Generates a cryptographically random share token.
 *
 * 32 bytes of entropy (256 bits) encoded as URL-safe base64 (no padding).
 * Result is 43 characters, suitable for use in URLs and as a Prisma @unique
 * primary lookup key. Collision probability is negligible.
 */
export function generateShareToken(): string {
  return randomBytes(32).toString('base64url')
}
