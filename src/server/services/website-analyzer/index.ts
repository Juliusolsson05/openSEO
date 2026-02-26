/**
 * Website Analyzer Service
 *
 * Orchestrates: scrape website → extract profile with AI → persist to company.
 * Can run as a background task with progress logging.
 */

import { prisma } from '@/lib/prisma'
import { NotFoundError } from '@/server/api/errors'
import { appendTaskLog, completeTask, createTask, failTask, setTaskRunning } from '@/server/tasks/runtime'
import { scrapeWebsite } from './scraper'
import { extractCompanyProfile, type CompanyProfile } from './extract-profile'

export type { CompanyProfile }

/**
 * Run website analysis as a background task.
 * Returns a task ID that can be polled for status.
 */
export function analyzeWebsiteAsync(companyId: number, websiteUrl: string) {
  const task = createTask()

  void (async () => {
    try {
      setTaskRunning(task.id, 'website_analysis')

      // Step 1: Scrape
      appendTaskLog(task.id, { stage: 'scrape', type: 'started', data: { url: websiteUrl } })
      const scrapeResult = await scrapeWebsite(websiteUrl)

      if (scrapeResult.pages.length === 0) {
        failTask(task.id, `Could not fetch any pages from ${websiteUrl}. Check the URL is accessible.`)
        return
      }

      appendTaskLog(task.id, {
        stage: 'scrape',
        type: 'completed',
        data: {
          pages: scrapeResult.pages.map((p) => ({ url: p.url, title: p.title, textLength: p.text.length })),
        },
      })

      // Step 2: Extract profile with AI
      appendTaskLog(task.id, { stage: 'extract', type: 'started', data: { pageCount: scrapeResult.pages.length } })
      const profile = await extractCompanyProfile(scrapeResult.pages)
      appendTaskLog(task.id, { stage: 'extract', type: 'completed', data: { industry: profile.industry } })

      // Step 3: Persist
      appendTaskLog(task.id, { stage: 'persist', type: 'started' })
      await saveProfile(companyId, websiteUrl, profile)
      appendTaskLog(task.id, { stage: 'persist', type: 'completed' })

      completeTask(task.id, `Profile extracted: ${profile.industry} — ${profile.business_description.slice(0, 100)}`)
    } catch (error) {
      failTask(task.id, error instanceof Error ? error.message : String(error))
    }
  })()

  return { task_id: task.id, status: 'accepted' as const }
}

/**
 * Run website analysis synchronously (for registration flow).
 * Returns the extracted profile.
 */
export async function analyzeWebsiteSync(companyId: number, websiteUrl: string): Promise<CompanyProfile> {
  const scrapeResult = await scrapeWebsite(websiteUrl)

  if (scrapeResult.pages.length === 0) {
    throw new Error(`Could not fetch any pages from ${websiteUrl}`)
  }

  const profile = await extractCompanyProfile(scrapeResult.pages)
  await saveProfile(companyId, websiteUrl, profile)
  return profile
}

/**
 * Get the stored profile for a company.
 */
export async function getProfile(companyId: number): Promise<CompanyProfile | null> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { profile: true },
  })

  if (!company) throw new NotFoundError('Company not found')
  if (!company.profile) return null

  return company.profile as unknown as CompanyProfile
}

async function saveProfile(companyId: number, websiteUrl: string, profile: CompanyProfile) {
  const company = await prisma.company.findUnique({ where: { id: companyId } })
  if (!company) throw new NotFoundError('Company not found')

  await prisma.company.update({
    where: { id: companyId },
    data: {
      website_url: websiteUrl,
      profile: profile as any,
      // Also update legacy fields so existing AI generation benefits immediately
      business_type: profile.industry || company.business_type,
      language: profile.detected_language || company.language,
      keywords: profile.key_terminology.length > 0 ? profile.key_terminology as any : company.keywords as any,
      metadata: {
        ...(company.metadata as Record<string, unknown>),
        business_description: profile.business_description,
        industry_description: `${profile.industry}. Target audience: ${profile.target_audience}`,
      },
    },
  })
}
