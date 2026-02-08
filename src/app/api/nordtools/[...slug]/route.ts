import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { apiHandler } from '@/server/api/handler'
import { NotFoundError, ValidationError } from '@/server/api/errors'
import { error, raw } from '@/server/api/response'
import { SETTINGS_SCHEMA_CATALOG, settingsService } from '@/server/services/settings.service'

function getSlugParts(params: Record<string, unknown>): string[] {
  const value = params.slug
  if (Array.isArray(value)) return value.map(String)
  if (typeof value === 'string') return value.split('/').filter(Boolean)
  return []
}

function withDeprecationHeaders(response: NextResponse) {
  response.headers.set('deprecation', 'true')
  response.headers.set('sunset', '2026-12-31T23:59:59Z')
  response.headers.set('link', '</docs/settings-migration-plan.md>; rel="deprecation"')
  return response
}

function methodNotImplemented(path: string) {
  return withDeprecationHeaders(error(`Endpoint not implemented yet: /api/nordtools/${path}`, 501))
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

async function getCompany(companyId: number) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  })

  if (!company) {
    throw new NotFoundError('Company not found')
  }

  return company
}

const CATEGORY_TO_DOMAIN = {
  'aurora.blog': 'generation',
  'aurora.extensions': 'integrations',
  'aurora.blog.quillo': 'quillo',
} as const

function resolveDomain(category: string) {
  return CATEGORY_TO_DOMAIN[category as keyof typeof CATEGORY_TO_DOMAIN] ?? null
}

const routeHandler = apiHandler(async (ctx) => {
  if (!ctx.companyId) throw new NotFoundError('Missing company context')

  const slug = getSlugParts(ctx.params)
  const path = slug.join('/')

  if (path === 'company/get') {
    const publishing = await settingsService.getDomain(ctx.companyId, 'publishing')
    const general = await settingsService.getDomain(ctx.companyId, 'general')
    return withDeprecationHeaders(raw({
      id: general.company_id,
      name: (general.settings as Record<string, unknown>).name,
      api_endpoint: (publishing.settings as Record<string, unknown>).api_endpoint,
      api_key: (publishing.settings as Record<string, unknown>).has_api_key ? '***' : null,
    }))
  }

  if (path === 'company/credentials/update') {
    const body = asObject(ctx.body)
    const apiKey = String(body.api_key ?? ctx.searchParams.get('api_key') ?? '').trim()
    const apiEndpoint = String(body.api_endpoint ?? ctx.searchParams.get('api_endpoint') ?? '').trim()

    if (!apiEndpoint) {
      throw new ValidationError('api_endpoint is required')
    }

    await settingsService.updateDomain(ctx.companyId, 'publishing', {
      api_endpoint: apiEndpoint,
      ...(apiKey ? { api_key: apiKey } : {}),
    })

    return withDeprecationHeaders(raw({ detail: 'Publishing credentials updated successfully.' }))
  }

  if (path === 'company/metadata') {
    const body = asObject(ctx.body)

    if (Object.keys(body).length > 0) {
      await settingsService.updateDomain(ctx.companyId, 'general', {
        ...(body.business_description !== undefined ? { business_description: String(body.business_description) } : {}),
        ...(body.industry_description !== undefined ? { industry_description: String(body.industry_description) } : {}),
      })
    }

    const general = await settingsService.getDomain(ctx.companyId, 'general')
    const settings = general.settings as Record<string, unknown>

    return withDeprecationHeaders(raw({
      business_description: String(settings.business_description ?? ''),
      industry_description: String(settings.industry_description ?? ''),
    }))
  }

  if (path === 'company/metadata/scrape') {
    const { analyzeWebsiteAsync } = await import('@/server/services/website-analyzer')
    const company = await getCompany(ctx.companyId)
    const url = (ctx.body as Record<string, unknown>)?.website_url ?? company.website_url
    if (!url) return withDeprecationHeaders(raw({ detail: 'No website_url provided or configured' }, 400))
    const result = analyzeWebsiteAsync(ctx.companyId, String(url))
    return withDeprecationHeaders(raw(result, 202))
  }

  if (path === 'settings/get') {
    const category = ctx.searchParams.get('category')
    if (category) {
      const domain = resolveDomain(category)
      if (!domain) throw new ValidationError(`Unknown settings category: ${category}`)

      const selected = SETTINGS_SCHEMA_CATALOG[domain]
      return withDeprecationHeaders(raw({
        category,
        label: domain,
        description: selected.description,
        fields: selected.writable_fields,
      }))
    }

    return withDeprecationHeaders(raw({
      categories: Object.keys(CATEGORY_TO_DOMAIN),
      settings: Object.entries(CATEGORY_TO_DOMAIN).map(([legacyCategory, domain]) => ({
        category: legacyCategory,
        label: domain,
        description: SETTINGS_SCHEMA_CATALOG[domain].description,
        fields: SETTINGS_SCHEMA_CATALOG[domain].writable_fields,
      })),
    }))
  }

  if (path === 'settings') {
    const category = ctx.searchParams.get('category')
    if (!category) throw new ValidationError('Missing required query parameter: category')

    const domain = resolveDomain(category)
    if (domain) {
      const selected = await settingsService.getDomain(ctx.companyId, domain)
      return withDeprecationHeaders(raw({ settings: selected.settings }))
    }

    const company = await getCompany(ctx.companyId)
    const settings = asObject(company.settings)
    return withDeprecationHeaders(raw({ settings: asObject(settings[category]) }))
  }

  if (path === 'settings/update') {
    const category = ctx.searchParams.get('category')
    if (!category) throw new ValidationError('Missing required query parameter: category')

    const body = asObject(ctx.body)
    const nextSettings = asObject(body.settings)

    const domain = resolveDomain(category)
    if (domain) {
      const updated = await settingsService.updateDomain(ctx.companyId, domain, nextSettings)
      return withDeprecationHeaders(raw({ settings: updated.settings }))
    }

    const company = await getCompany(ctx.companyId)
    const settings = asObject(company.settings)
    const existingCategory = asObject(settings[category])
    const merged = { ...existingCategory, ...nextSettings }

    const updated = await prisma.company.update({
      where: { id: ctx.companyId },
      data: {
        settings: {
          ...settings,
          [category]: merged,
        } as Prisma.InputJsonValue,
      },
      select: { settings: true },
    })

    return withDeprecationHeaders(raw({ settings: asObject(asObject(updated.settings)[category]) }))
  }

  return methodNotImplemented(path)
})

export const GET = routeHandler
export const POST = routeHandler
