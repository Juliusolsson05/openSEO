/**
 * GET /api/v1/company/profile
 * PATCH /api/v1/company/profile
 *
 * Returns and updates the company's website URL and extracted profile.
 */

import { Prisma } from '@prisma/client'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'
import { apiHandler } from '@/server/api/handler'
import { raw, success } from '@/server/api/response'
import { NotFoundError, ValidationError } from '@/server/api/errors'

const companyProfileSchema = z.object({
  business_description: z.string().max(10000),
  industry: z.string().max(255),
  target_audience: z.string().max(5000),
  tone_of_voice: z.array(z.string().min(1).max(255)),
  products_services: z.array(z.string().min(1).max(255)),
  key_terminology: z.array(z.string().min(1).max(255)),
  content_topics: z.array(z.string().min(1).max(255)),
  differentiators: z.array(z.string().min(1).max(255)),
  detected_language: z.string().min(2).max(16),
  _scraped_at: z.string().optional(),
  _pages_analyzed: z.number().int().optional(),
})

const patchBodySchema = z.object({
  profile: companyProfileSchema,
})

export const GET = apiHandler(async (ctx) => {
  const company = await prisma.company.findUnique({
    where: { id: ctx.companyId! },
    select: { website_url: true, profile: true, name: true, business_type: true, language: true, keywords: true },
  })

  if (!company) throw new NotFoundError('Company not found')

  return success({
    website_url: company.website_url,
    profile: company.profile,
    name: company.name,
    business_type: company.business_type,
    language: company.language,
    keywords: company.keywords,
  })
})

export const PATCH = apiHandler(async ({ companyId, body }) => {
  if (!companyId) throw new ValidationError('Missing company ID in session')

  const parsed = patchBodySchema.safeParse(body)
  if (!parsed.success) throw new ValidationError('Invalid profile payload')

  const { profile } = parsed.data

  const existing = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true, metadata: true },
  })

  if (!existing) throw new NotFoundError('Company not found')

  const metadata = existing.metadata && typeof existing.metadata === 'object' && !Array.isArray(existing.metadata)
    ? (existing.metadata as Record<string, unknown>)
    : {}

  const updated = await prisma.company.update({
    where: { id: companyId },
    data: {
      profile: profile as Prisma.InputJsonValue,
      business_type: profile.industry,
      language: profile.detected_language,
      keywords: profile.key_terminology,
      metadata: {
        ...metadata,
        business_description: profile.business_description,
        industry_description: `${profile.industry}${profile.target_audience ? ` · ${profile.target_audience}` : ''}`,
      } as Prisma.InputJsonValue,
    },
    select: {
      website_url: true,
      profile: true,
      name: true,
      business_type: true,
      language: true,
      keywords: true,
    },
  })

  return success(updated)
})
