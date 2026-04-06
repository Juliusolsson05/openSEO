import bcrypt from 'bcryptjs'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'
import { vault } from '@/lib/vault'
import { apiHandler } from '@/server/api/handler'
import { ForbiddenError, ValidationError } from '@/server/api/errors'
import { success } from '@/server/api/response'
import { validate } from '@/server/api/validate'
import { getSetupStatus } from '@/server/setup'

const setupSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Valid email is required').toLowerCase().trim(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  companyName: z.string().min(1, 'Company name is required').trim(),
  websiteUrl: z.string().trim().optional().or(z.literal('')),
  integrations: z.record(z.string(), z.string().trim()).default({}),
})

const REQUIRED_AI_KEYS = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'GEMINI_API_KEY'] as const

export const POST = apiHandler(async ({ body }, req) => {
  const status = await getSetupStatus()
  if (status.complete) {
    throw new ForbiddenError('Setup has already been completed')
  }

  const { name, email, password, companyName, websiteUrl, integrations } = validate(setupSchema, body)

  const aiKeys = REQUIRED_AI_KEYS.filter((key) => integrations[key])
  if (aiKeys.length === 0) {
    throw new ValidationError('Configure at least one AI provider key to finish setup')
  }

  const existingUser = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  if (existingUser) {
    throw new ValidationError('A user with this email already exists')
  }

  for (const key of aiKeys) {
    const result = await vault.test(key, integrations[key])
    if (!result.ok) {
      throw new ValidationError(result.error ?? `Failed to validate ${key}`)
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const company = await prisma.company.create({
    data: {
      name: companyName,
      business_type: companyName,
      language: 'en',
      keywords: [],
      website_url: websiteUrl || null,
      settings: { onboarding: { completed_at: new Date().toISOString() } },
    },
    select: { id: true },
  })

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      companyId: company.id,
      userType: 'ADMINISTRATOR',
    },
    select: { id: true, email: true },
  })

  for (const [key, value] of Object.entries(integrations)) {
    if (value && value.trim()) {
      await vault.set(key, value.trim())
    }
  }

  return success({ userId: user.id, email: user.email, companyId: company.id }, 201)
}, { auth: false })
