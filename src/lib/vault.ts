import 'server-only'

import crypto from 'node:crypto'
import { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'

type VaultCategory = 'ai' | 'media' | 'system'

type VaultKeyConfig = {
  category: VaultCategory
  label: string
  hint?: string
  envFallback?: string[]
}

type EncryptedPayload = {
  iv: string
  tag: string
  data: string
}

const algorithm = 'aes-256-gcm'
const ivLength = 12

const VAULT_KEY_CATALOG: Record<string, VaultKeyConfig> = {
  OPENAI_API_KEY: {
    category: 'ai',
    label: 'OpenAI API key',
    hint: 'Get this from platform.openai.com',
    envFallback: ['OPENAI_API_KEY'],
  },
  ANTHROPIC_API_KEY: {
    category: 'ai',
    label: 'Anthropic API key',
    hint: 'Get this from console.anthropic.com',
    envFallback: ['ANTHROPIC_API_KEY'],
  },
  GEMINI_API_KEY: {
    category: 'ai',
    label: 'Google Gemini API key',
    hint: 'Get this from ai.google.dev',
    envFallback: ['GEMINI_API_KEY', 'GOOGLE_GENAI_API_KEY', 'GOOGLE_AI_API_KEY'],
  },
  IDEOGRAM: {
    category: 'media',
    label: 'Ideogram API key',
    envFallback: ['IDEOGRAM'],
  },
  PEXELS: {
    category: 'media',
    label: 'Pexels API key',
    envFallback: ['PEXELS', 'PEXELS_API_KEY'],
  },
  OPENSEO_OUTBOUND_KEY: {
    category: 'system',
    label: 'OpenSEO outbound webhook key',
    envFallback: ['OPENSEO_OUTBOUND_KEY', 'AURORA_OUTBOUND_KEY'],
  },
}

function getConfig(key: string): VaultKeyConfig {
  return VAULT_KEY_CATALOG[key] ?? { category: 'system', label: key, envFallback: [key] }
}

function getMasterKey(): Buffer {
  const raw = process.env.OPENSEO_ENCRYPTION_KEY
  if (!raw) {
    throw new Error('OPENSEO_ENCRYPTION_KEY is required to use the encrypted settings vault')
  }

  const key = Buffer.from(raw, 'base64')
  if (key.length !== 32) {
    throw new Error('OPENSEO_ENCRYPTION_KEY must decode to exactly 32 bytes')
  }

  return key
}

function encryptValue(value: string): string {
  const iv = crypto.randomBytes(ivLength)
  const cipher = crypto.createCipheriv(algorithm, getMasterKey(), iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  const payload: EncryptedPayload = {
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
    data: encrypted.toString('hex'),
  }

  return JSON.stringify(payload)
}

function decryptValue(payload: string): string {
  const parsed = JSON.parse(payload) as Partial<EncryptedPayload>
  if (!parsed.iv || !parsed.tag || !parsed.data) {
    throw new Error('Encrypted vault payload is malformed')
  }

  const decipher = crypto.createDecipheriv(
    algorithm,
    getMasterKey(),
    Buffer.from(parsed.iv, 'hex'),
  )
  decipher.setAuthTag(Buffer.from(parsed.tag, 'hex'))

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(parsed.data, 'hex')),
    decipher.final(),
  ])

  return decrypted.toString('utf8')
}

function getEnvFallback(key: string): string | null {
  const config = getConfig(key)
  for (const envName of config.envFallback ?? []) {
    const value = process.env[envName]
    if (value && value.trim()) return value.trim()
  }
  return null
}

function isMissingSystemSettingTable(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021'
}

async function readStoredValue(key: string): Promise<string | null> {
  try {
    const row = await prisma.systemSetting.findUnique({
      where: { key },
      select: { value: true },
    })

    if (!row) return null
    return decryptValue(row.value)
  } catch (error) {
    if (isMissingSystemSettingTable(error)) return null
    throw error
  }
}

export const vault = {
  async get(key: string): Promise<string | null> {
    const stored = await readStoredValue(key)
    if (stored) return stored
    return getEnvFallback(key)
  },

  async set(key: string, value: string): Promise<void> {
    const config = getConfig(key)
    const encrypted = encryptValue(value)

    await prisma.systemSetting.upsert({
      where: { key },
      create: {
        key,
        value: encrypted,
        category: config.category,
        label: config.label,
        hint: config.hint,
      },
      update: {
        value: encrypted,
        category: config.category,
        label: config.label,
        hint: config.hint ?? null,
      },
    })
  },

  async delete(key: string): Promise<void> {
    try {
      await prisma.systemSetting.deleteMany({ where: { key } })
    } catch (error) {
      if (isMissingSystemSettingTable(error)) return
      throw error
    }
  },

  async has(key: string): Promise<boolean> {
    try {
      const count = await prisma.systemSetting.count({ where: { key } })
      return count > 0 || getEnvFallback(key) !== null
    } catch (error) {
      if (isMissingSystemSettingTable(error)) return getEnvFallback(key) !== null
      throw error
    }
  },

  async list() {
    let rows: Array<{ key: string; category: string; label: string; hint: string | null; updatedAt: Date }> = []

    try {
      rows = await prisma.systemSetting.findMany({
        orderBy: [{ category: 'asc' }, { label: 'asc' }],
        select: {
          key: true,
          category: true,
          label: true,
          hint: true,
          updatedAt: true,
        },
      })
    } catch (error) {
      if (!isMissingSystemSettingTable(error)) throw error
    }

    return rows.map((row) => ({
      ...row,
      maskedValue: '********',
      source: 'vault' as const,
    }))
  },

  async test(key: string, overrideValue?: string): Promise<{ ok: boolean; error?: string }> {
    const value = overrideValue ?? (await vault.get(key))
    if (!value) return { ok: false, error: `${key} is not configured` }

    try {
      switch (key) {
        case 'OPENAI_API_KEY': {
          const response = await fetch('https://api.openai.com/v1/models', {
            headers: { Authorization: `Bearer ${value}` },
          })
          if (!response.ok) return { ok: false, error: `OpenAI responded with ${response.status}` }
          return { ok: true }
        }
        case 'ANTHROPIC_API_KEY': {
          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'x-api-key': value,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model: 'claude-sonnet-4-5-20250929',
              max_tokens: 1,
              messages: [{ role: 'user', content: 'ping' }],
            }),
          })
          if (!response.ok) return { ok: false, error: `Anthropic responded with ${response.status}` }
          return { ok: true }
        }
        case 'GEMINI_API_KEY': {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(value)}`,
          )
          if (!response.ok) return { ok: false, error: `Gemini responded with ${response.status}` }
          return { ok: true }
        }
        case 'PEXELS': {
          const response = await fetch('https://api.pexels.com/v1/search?query=test&per_page=1', {
            headers: { Authorization: value },
          })
          if (!response.ok) return { ok: false, error: `Pexels responded with ${response.status}` }
          return { ok: true }
        }
        default:
          return { ok: true }
      }
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : 'Unknown vault test error' }
    }
  },
}

export type VaultKey = keyof typeof VAULT_KEY_CATALOG
export { VAULT_KEY_CATALOG }
