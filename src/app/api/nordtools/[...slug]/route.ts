import { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import { apiHandler } from '@/server/api/handler'
import { NotFoundError, ValidationError } from '@/server/api/errors'
import { error, raw } from '@/server/api/response'

function getSlugParts(params: Record<string, unknown>): string[] {
  const value = params.slug
  if (Array.isArray(value)) return value.map(String)
  if (typeof value === 'string') return value.split('/').filter(Boolean)
  return []
}

function methodNotImplemented(path: string) {
  return error(`Endpoint not implemented yet: /api/nordtools/${path}`, 501)
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

const SETTINGS_STRUCTURE = {
  'aurora.blog': {
    category: 'aurora.blog',
    label: 'Blog',
    description: 'Core Aurora blog generation settings.',
    fields: [
      {
        key: 'default_language',
        metadata: {
          type: 'select',
          label: 'Default language',
          description: 'Language used when generating new content.',
          default: 'en',
          options: [
            { label: 'English', value: 'en' },
            { label: 'Swedish', value: 'sv' },
            { label: 'Norwegian', value: 'no' },
            { label: 'Danish', value: 'da' },
            { label: 'German', value: 'de' },
          ],
          required: true,
        },
      },
      {
        key: 'tone_of_voice',
        metadata: {
          type: 'textarea',
          label: 'Tone of voice',
          description: 'General writing style instructions used across generated posts.',
          default: '',
          placeholder: 'Helpful, concise, and professional…',
        },
      },
      {
        key: 'auto_internal_linking',
        metadata: {
          type: 'boolean',
          label: 'Enable internal linking',
          description: 'Automatically inject internal links where relevant.',
          default: true,
        },
      },
      {
        key: 'default_post_length',
        metadata: {
          type: 'number',
          label: 'Default post length (words)',
          description: 'Target word count for generated blog posts.',
          default: 1200,
          min: 300,
          max: 5000,
          step: 50,
        },
      },
    ],
  },
  'aurora.extensions': {
    category: 'aurora.extensions',
    label: 'Extensions',
    description: 'Feature and integration toggles for Aurora.',
    fields: [
      {
        key: 'wordpress_enabled',
        metadata: {
          type: 'boolean',
          label: 'WordPress integration',
          description: 'Enable WordPress upload and sync capabilities.',
          default: false,
        },
      },
      {
        key: 'shopify_enabled',
        metadata: {
          type: 'boolean',
          label: 'Shopify integration',
          description: 'Enable Shopify product import for recommendations.',
          default: false,
        },
      },
      {
        key: 'quillo_enabled',
        metadata: {
          type: 'boolean',
          label: 'Enable Quillo AI',
          description: 'Enable Quillo analysis and social post generation features.',
          default: true,
        },
      },
    ],
  },
  'aurora.blog.quillo': {
    category: 'aurora.blog.quillo',
    label: 'Quillo',
    description: 'Quillo-specific prompts and generation controls.',
    fields: [
      {
        key: 'brand_voice_prompt',
        metadata: {
          type: 'textarea',
          label: 'Brand voice prompt',
          description: 'Prompt prepended when Quillo generates social snippets.',
          default: '',
          placeholder: 'Write in a clear and upbeat style…',
        },
      },
      {
        key: 'autopilot_enabled',
        metadata: {
          type: 'boolean',
          label: 'Enable Quillo autopilot',
          description: 'Allow automated Quillo workflows where supported.',
          default: false,
        },
      },
      {
        key: 'default_channels',
        metadata: {
          type: 'multiselect',
          label: 'Default channels',
          description: 'Channels selected by default when creating Quillo posts.',
          default: ['facebook'],
          options: [
            { label: 'Facebook', value: 'facebook' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'X / Twitter', value: 'twitter' },
          ],
        },
      },
    ],
  },
  'aurora.blog.model_controls': {
    category: 'aurora.blog.model_controls',
    label: 'Model controls',
    description: 'Advanced model behavior tuning for blog generation.',
    fields: [
      {
        key: 'model',
        metadata: {
          type: 'select',
          label: 'Model',
          description: 'Model identifier used for generation tasks.',
          default: 'gpt-4o-mini',
          options: [
            { label: 'GPT-4o mini', value: 'gpt-4o-mini' },
            { label: 'GPT-4o', value: 'gpt-4o' },
          ],
          required: true,
        },
      },
      {
        key: 'temperature',
        metadata: {
          type: 'number',
          label: 'Temperature',
          description: 'Lower values are more deterministic, higher are more creative.',
          default: 0.7,
          min: 0,
          max: 2,
          step: 0.1,
        },
      },
      {
        key: 'top_p',
        metadata: {
          type: 'number',
          label: 'Top P',
          description: 'Nucleus sampling threshold.',
          default: 1,
          min: 0,
          max: 1,
          step: 0.05,
        },
      },
      {
        key: 'max_tokens',
        metadata: {
          type: 'number',
          label: 'Max tokens',
          description: 'Maximum token budget for generation output.',
          default: 2048,
          min: 256,
          max: 8192,
          step: 64,
        },
      },
    ],
  },
} as const

const routeHandler = apiHandler(async (ctx) => {
  if (!ctx.companyId) throw new NotFoundError('Missing company context')

  const slug = getSlugParts(ctx.params)
  const path = slug.join('/')

  if (path === 'company/get') {
    const company = await getCompany(ctx.companyId)
    return raw({
      ...company,
      id: company.id,
      name: company.name,
    })
  }

  if (path === 'company/credentials/update') {
    const apiKey = ctx.searchParams.get('api_key')
    const apiEndpoint = ctx.searchParams.get('api_endpoint')

    if (!apiKey || !apiEndpoint) {
      throw new ValidationError('Missing required query parameters: api_key and api_endpoint')
    }

    await prisma.company.update({
      where: { id: ctx.companyId },
      data: {
        api_key: apiKey,
        api_endpoint: apiEndpoint,
      },
      select: { id: true },
    })

    return raw({ detail: 'Publishing credentials updated successfully.' })
  }

  if (path === 'company/metadata') {
    const company = await getCompany(ctx.companyId)
    const metadata = asObject(company.metadata)

    return raw({
      business_description: String(metadata.business_description ?? ''),
      industry_description: String(metadata.industry_description ?? ''),
    })
  }

  if (path === 'company/metadata/scrape') {
    return raw({ task_id: 'not_available', status: 'not_available', detail: 'Task queue not migrated' }, 501)
  }

  if (path === 'settings/get') {
    const category = ctx.searchParams.get('category')
    if (category) {
      const selected = SETTINGS_STRUCTURE[category as keyof typeof SETTINGS_STRUCTURE]
      if (!selected) throw new ValidationError(`Unknown settings category: ${category}`)
      return raw(selected)
    }

    return raw({
      categories: Object.keys(SETTINGS_STRUCTURE),
      settings: Object.values(SETTINGS_STRUCTURE),
    })
  }

  if (path === 'settings') {
    const category = ctx.searchParams.get('category')
    if (!category) throw new ValidationError('Missing required query parameter: category')

    const company = await getCompany(ctx.companyId)
    const settings = asObject(company.settings)

    return raw({ settings: asObject(settings[category]) })
  }

  if (path === 'settings/update') {
    const category = ctx.searchParams.get('category')
    if (!category) throw new ValidationError('Missing required query parameter: category')

    const body = asObject(ctx.body)
    const nextSettings = asObject(body.settings)

    const company = await getCompany(ctx.companyId)
    const settings = asObject(company.settings)

    // Deep-merge into existing category settings so we don't clobber sibling keys
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

    return raw({ settings: asObject(asObject(updated.settings)[category]) })
  }

  return methodNotImplemented(path)
})

export const GET = routeHandler
export const POST = routeHandler
