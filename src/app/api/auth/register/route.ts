import bcrypt from 'bcryptjs'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'
import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { ForbiddenError } from '@/server/api/errors'
import { validate } from '@/server/api/validate'
import { analyzeWebsiteAsync } from '@/server/services/website-analyzer'

function parseHost(url: string): string | null {
  try {
    const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`
    return new URL(withProtocol).hostname
  } catch {
    return null
  }
}

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirm: z.string(),
  company_name: z.string().min(1, 'Company name is required').trim(),
  company_url: z.string().min(1, 'Company URL is required').trim(),
}).refine((data) => data.password === data.password_confirm, {
  message: 'Passwords do not match',
  path: ['password_confirm'],
}).refine((data) => parseHost(data.company_url) !== null, {
  message: 'Please enter a valid company URL',
  path: ['company_url'],
})

export const POST = apiHandler(
  async (ctx, req) => {
    const { name, email, password, company_name, company_url } = validate(registerSchema, ctx.body)

    const invited = await prisma.user.findUnique({ where: { email } })
    if (!invited || invited.password) {
      throw new ForbiddenError('This email is not approved for signup yet.')
    }

    const hashed = await bcrypt.hash(password, 10)

    const company = await prisma.company.create({
      data: {
        name: company_name,
        business_type: company_name,
        language: 'en',
        keywords: [],
        website_url: company_url,
        settings: { onboarding: { completed_at: new Date().toISOString() } },
      },
    })

    // Fire-and-forget: scrape website and build company profile.
    // analyzeWebsiteAsync returns synchronously (launches an async IIFE
    // internally with its own error handling), so no try/catch needed here.
    analyzeWebsiteAsync(company.id, company_url)

    await prisma.user.update({
      where: { id: invited.id },
      data: { name, password: hashed, companyId: company.id, userType: 'ADMINISTRATOR' },
    })

    return raw({ status: 'ok' }, 201)
  },
  { auth: false },
)
