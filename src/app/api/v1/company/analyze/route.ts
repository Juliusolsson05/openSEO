/**
 * POST /api/v1/company/analyze
 *
 * Triggers website analysis for the current company.
 * Accepts { website_url: string }.
 * Returns a task_id that can be polled via /api/v1/publishing/jobs/:taskId
 */

import { prisma } from '@/lib/prisma'
import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { ValidationError } from '@/server/api/errors'
import { analyzeWebsiteAsync } from '@/server/services/website-analyzer'

export const POST = apiHandler(async (ctx) => {
  const body = (ctx.body ?? {}) as Record<string, unknown>
  const websiteUrl = String(body.website_url ?? body.url ?? '').trim()

  if (!websiteUrl) {
    throw new ValidationError('website_url is required')
  }

  try {
    const withProtocol = /^https?:\/\//i.test(websiteUrl) ? websiteUrl : `https://${websiteUrl}`
    new URL(withProtocol)
  } catch {
    throw new ValidationError('Invalid URL format')
  }

  // Save URL immediately
  await prisma.company.update({
    where: { id: ctx.companyId! },
    data: { website_url: websiteUrl },
  })

  const result = analyzeWebsiteAsync(ctx.companyId!, websiteUrl)
  return raw(result, 202)
})
