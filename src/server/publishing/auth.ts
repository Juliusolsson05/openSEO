import crypto from 'crypto'

import { prisma } from '@/lib/prisma'

const RAW_KEY_LENGTH = 32

function sha256(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

export function createApiKey() {
  const raw = `aur_${crypto.randomBytes(RAW_KEY_LENGTH).toString('hex')}`
  const prefix = raw.slice(0, 12)
  const hash = sha256(raw)
  return { raw, prefix, hash }
}

export async function resolveCompanyByInboundApiKey(rawKey: string) {
  if (!rawKey) return null
  const hash = sha256(rawKey)

  const apiKey = await prisma.publishingApiKey.findFirst({
    where: {
      key_hash: hash,
      is_active: true,
      revoked_at: null,
    },
    include: {
      company: {
        select: { id: true },
      },
    },
  })

  if (!apiKey?.company?.id) return null

  await prisma.publishingApiKey.update({
    where: { id: apiKey.id },
    data: { last_used_at: new Date() },
  })

  return apiKey.company.id
}

export function signPayload(secret: string, payload: string) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

export function safeCompare(a: string, b: string) {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  if (aBuf.length !== bBuf.length) return false
  return crypto.timingSafeEqual(aBuf, bBuf)
}
