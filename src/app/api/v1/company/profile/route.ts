/**
 * GET /api/v1/company/profile
 *
 * Returns the company's website URL and extracted profile.
 */

import { prisma } from '@/lib/prisma'
import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { NotFoundError } from '@/server/api/errors'

export const GET = apiHandler(async (ctx) => {
  const company = await prisma.company.findUnique({
    where: { id: ctx.companyId! },
    select: { website_url: true, profile: true, name: true, business_type: true, language: true, keywords: true },
  })

  if (!company) throw new NotFoundError('Company not found')

  return raw({
    website_url: company.website_url,
    profile: company.profile,
    name: company.name,
    business_type: company.business_type,
    language: company.language,
    keywords: company.keywords,
  })
})
