import 'server-only'

import { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import { vault, VAULT_KEY_CATALOG } from '@/lib/vault'

const AI_PROVIDER_KEYS = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'GEMINI_API_KEY'] as const

export async function getSetupStatus() {
  const [adminCount, companyCount] = await Promise.all([
    prisma.user.count({ where: { userType: 'ADMINISTRATOR' } }),
    prisma.company.count(),
  ])

  const configuredProviderKeys: string[] = []

  for (const key of AI_PROVIDER_KEYS) {
    if (await vault.has(key)) {
      configuredProviderKeys.push(key)
    }
  }

  return {
    complete: adminCount > 0 && companyCount > 0 && configuredProviderKeys.length > 0,
    hasAdminUser: adminCount > 0,
    hasCompany: companyCount > 0,
    hasAiProvider: configuredProviderKeys.length > 0,
    configuredProviderKeys,
  }
}

function maskValue(value: string): string {
  if (!value) return '********'
  if (value.length <= 8) return `${value.slice(0, 2)}***${value.slice(-1)}`
  return `${value.slice(0, 6)}...${value.slice(-4)}`
}

export async function listIntegrationSettings() {
  let rows: Array<{
    key: string
    category: string
    label: string
    hint: string | null
    value: string
    updatedAt: Date
  }> = []

  try {
    rows = await prisma.systemSetting.findMany({
      select: {
        key: true,
        category: true,
        label: true,
        hint: true,
        value: true,
        updatedAt: true,
      },
    })
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021')) {
      throw error
    }
  }

  const rowMap = new Map(rows.map((row) => [row.key, row]))

  return Promise.all(
    Object.entries(VAULT_KEY_CATALOG).map(async ([key, config]) => {
      const row = rowMap.get(key)
      if (row) {
        const decrypted = await vault.get(key)
        return {
          key,
          category: row.category,
          label: row.label,
          hint: row.hint,
          maskedValue: decrypted ? maskValue(decrypted) : null,
          configured: true,
          source: 'vault' as const,
          updatedAt: row.updatedAt.toISOString(),
        }
      }

      const fallback = await vault.get(key)

      return {
        key,
        category: config.category,
        label: config.label,
        hint: config.hint ?? null,
        maskedValue: fallback ? maskValue(fallback) : null,
        configured: Boolean(fallback),
        source: fallback ? ('env' as const) : ('missing' as const),
        updatedAt: null,
      }
    }),
  )
}
