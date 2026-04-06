import { z } from 'zod'

import { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import { MODELS } from '@/server/ai/clients'
import { NotFoundError, ValidationError } from '@/server/api/errors'

type JsonObject = Record<string, unknown>

export const SETTINGS_VERSION = 1

export const SETTINGS_SCHEMA_CATALOG = {
  general: {
    description: 'Company identity and metadata used by generation context.',
    writable_fields: ['name', 'language', 'business_type', 'keywords', 'business_description', 'industry_description'],
  },
  generation: {
    description: 'Blog generation controls and model selections.',
    writable_fields: ['default_language', 'tone_of_voice', 'auto_internal_linking', 'default_post_length', 'blog_post_structure_model', 'blog_post_content_model', 'initial_generation_elements'],
  },
  publishing: {
    description: 'Outbound publishing endpoint and auth key.',
    writable_fields: ['api_endpoint', 'api_key'],
  },
  integrations: {
    description: 'Feature toggles and external integration flags.',
    writable_fields: ['wordpress_enabled', 'shopify_enabled', 'quillo_enabled', 'aurora_enabled', 'pulse_enabled', 'echo_enabled'],
  },
  quillo: {
    description: 'Quillo-specific generation defaults.',
    writable_fields: ['brand_voice_prompt', 'autopilot_enabled', 'default_channels'],
  },
} as const

export const settingsDomainSchema = z.enum(['general', 'generation', 'publishing', 'integrations', 'quillo'])
export type SettingsDomain = z.infer<typeof settingsDomainSchema>

const generalPatchSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  language: z.string().min(2).max(16).optional(),
  business_type: z.string().max(255).optional(),
  keywords: z.array(z.string()).optional(),
  business_description: z.string().max(10000).optional(),
  industry_description: z.string().max(10000).optional(),
})

const generationPatchSchema = z.object({
  default_language: z.string().min(2).max(16).optional(),
  tone_of_voice: z.string().max(5000).optional(),
  auto_internal_linking: z.boolean().optional(),
  default_post_length: z.number().int().min(100).max(10000).optional(),
  blog_post_structure_model: z.string().min(1).max(128).optional(),
  blog_post_content_model: z.string().min(1).max(128).optional(),
  initial_generation_elements: z.record(z.string(), z.boolean()).optional(),
})

const publishingPatchSchema = z.object({
  api_endpoint: z.string().max(2048).nullable().optional(),
  api_key: z.string().max(2048).nullable().optional(),
})

const integrationsPatchSchema = z.object({
  wordpress_enabled: z.boolean().optional(),
  shopify_enabled: z.boolean().optional(),
  quillo_enabled: z.boolean().optional(),
  aurora_enabled: z.boolean().optional(),
  pulse_enabled: z.boolean().optional(),
  echo_enabled: z.boolean().optional(),
})

const quilloPatchSchema = z.object({
  brand_voice_prompt: z.string().max(5000).optional(),
  autopilot_enabled: z.boolean().optional(),
  default_channels: z.array(z.string().min(1)).optional(),
})

const patchSchemas: Record<SettingsDomain, z.ZodTypeAny> = {
  general: generalPatchSchema,
  generation: generationPatchSchema,
  publishing: publishingPatchSchema,
  integrations: integrationsPatchSchema,
  quillo: quilloPatchSchema,
}

function asObject(value: unknown): JsonObject {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as JsonObject)
    : {}
}

function normalizeSettings(value: unknown): JsonObject {
  return asObject(value)
}

function normalizeMetadata(value: unknown): JsonObject {
  return asObject(value)
}

export class SettingsService {
  private async getCompanyOrThrow(companyId: number) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        language: true,
        business_type: true,
        keywords: true,
        settings: true,
        metadata: true,
        api_endpoint: true,
        api_key: true,
        aurora_enabled: true,
        pulse_enabled: true,
        echo_enabled: true,
        created_at: true,
        updated_at: true,
      },
    })

    if (!company) throw new NotFoundError('Company not found')
    return company
  }

  private extractDomains(company: Awaited<ReturnType<SettingsService['getCompanyOrThrow']>>) {
    const settings = normalizeSettings(company.settings)
    const metadata = normalizeMetadata(company.metadata)

    const generation = asObject(settings['aurora.blog'])
    const integrations = asObject(settings['aurora.extensions'])
    const quillo = asObject(settings['aurora.blog.quillo'])

    return {
      general: {
        name: company.name,
        language: company.language,
        business_type: company.business_type,
        keywords: Array.isArray(company.keywords) ? company.keywords : [],
        business_description: String(metadata.business_description ?? ''),
        industry_description: String(metadata.industry_description ?? ''),
      },
      generation: {
        default_language: String(generation.default_language ?? company.language ?? 'en'),
        tone_of_voice: String(generation.tone_of_voice ?? ''),
        auto_internal_linking: Boolean(generation.auto_internal_linking ?? true),
        default_post_length: Number(generation.default_post_length ?? 1200),
        blog_post_structure_model: String(generation.blog_post_structure_model ?? MODELS.OPENAI_SMART),
        blog_post_content_model: String(generation.blog_post_content_model ?? MODELS.OPENAI_DEFAULT),
        initial_generation_elements: asObject(generation.initial_generation_elements),
      },
      publishing: {
        api_endpoint: company.api_endpoint,
        has_api_key: Boolean(company.api_key),
      },
      integrations: {
        aurora_enabled: company.aurora_enabled,
        pulse_enabled: company.pulse_enabled,
        echo_enabled: company.echo_enabled,
        wordpress_enabled: Boolean(integrations.wordpress_enabled ?? false),
        shopify_enabled: Boolean(integrations.shopify_enabled ?? false),
        quillo_enabled: Boolean(integrations.quillo_enabled ?? true),
      },
      quillo: {
        brand_voice_prompt: String(quillo.brand_voice_prompt ?? ''),
        autopilot_enabled: Boolean(quillo.autopilot_enabled ?? false),
        default_channels: Array.isArray(quillo.default_channels) ? quillo.default_channels : ['facebook'],
      },
    }
  }

  async getSnapshot(companyId: number) {
    const company = await this.getCompanyOrThrow(companyId)
    return {
      version: SETTINGS_VERSION,
      company_id: company.id,
      updated_at: company.updated_at.toISOString(),
      domains: this.extractDomains(company),
    }
  }

  async getDomain(companyId: number, domain: SettingsDomain) {
    const snapshot = await this.getSnapshot(companyId)
    return {
      version: snapshot.version,
      company_id: snapshot.company_id,
      domain,
      settings: snapshot.domains[domain],
      updated_at: snapshot.updated_at,
    }
  }

  async updateDomain(companyId: number, domain: SettingsDomain, payload: unknown) {
    const parsed = patchSchemas[domain].safeParse(payload)
    if (!parsed.success) throw new ValidationError('Invalid settings payload')

    const patch = parsed.data as JsonObject
    if (Object.keys(patch).length === 0) throw new ValidationError('No settings fields provided')

    const company = await this.getCompanyOrThrow(companyId)
    const settings = normalizeSettings(company.settings)

    if (domain === 'general') {
      const general = patch as z.infer<typeof generalPatchSchema>
      const metadata = normalizeMetadata(company.metadata)
      await prisma.company.update({
        where: { id: companyId },
        data: {
          ...(general.name !== undefined ? { name: general.name } : {}),
          ...(general.language !== undefined ? { language: general.language } : {}),
          ...(general.business_type !== undefined ? { business_type: general.business_type } : {}),
          ...(general.keywords !== undefined ? { keywords: general.keywords } : {}),
          ...(
            general.business_description !== undefined || general.industry_description !== undefined
              ? {
                  metadata: {
                    ...metadata,
                    ...(general.business_description !== undefined
                      ? { business_description: general.business_description }
                      : {}),
                    ...(general.industry_description !== undefined
                      ? { industry_description: general.industry_description }
                      : {}),
                  } as Prisma.InputJsonValue,
                }
              : {}
          ),
        },
      })
    } else if (domain === 'publishing') {
      const publishing = patch as z.infer<typeof publishingPatchSchema>
      await prisma.company.update({
        where: { id: companyId },
        data: {
          ...(publishing.api_endpoint !== undefined ? { api_endpoint: publishing.api_endpoint } : {}),
          ...(publishing.api_key !== undefined ? { api_key: publishing.api_key } : {}),
        },
      })
    } else if (domain === 'integrations') {
      const integrations = patch as z.infer<typeof integrationsPatchSchema>
      const settingsExtensions = asObject(settings['aurora.extensions'])
      await prisma.company.update({
        where: { id: companyId },
        data: {
          ...(integrations.aurora_enabled !== undefined ? { aurora_enabled: integrations.aurora_enabled } : {}),
          ...(integrations.pulse_enabled !== undefined ? { pulse_enabled: integrations.pulse_enabled } : {}),
          ...(integrations.echo_enabled !== undefined ? { echo_enabled: integrations.echo_enabled } : {}),
          settings: {
            ...settings,
            'aurora.extensions': {
              ...settingsExtensions,
              ...(integrations.wordpress_enabled !== undefined ? { wordpress_enabled: integrations.wordpress_enabled } : {}),
              ...(integrations.shopify_enabled !== undefined ? { shopify_enabled: integrations.shopify_enabled } : {}),
              ...(integrations.quillo_enabled !== undefined ? { quillo_enabled: integrations.quillo_enabled } : {}),
            },
          } as Prisma.InputJsonValue,
        },
      })
    } else if (domain === 'generation') {
      const generation = patch as z.infer<typeof generationPatchSchema>
      const current = asObject(settings['aurora.blog'])
      await prisma.company.update({
        where: { id: companyId },
        data: {
          settings: {
            ...settings,
            'aurora.blog': {
              ...current,
              ...generation,
            },
          } as Prisma.InputJsonValue,
        },
      })
    } else if (domain === 'quillo') {
      const quillo = patch as z.infer<typeof quilloPatchSchema>
      const current = asObject(settings['aurora.blog.quillo'])
      await prisma.company.update({
        where: { id: companyId },
        data: {
          settings: {
            ...settings,
            'aurora.blog.quillo': {
              ...current,
              ...quillo,
            },
          } as Prisma.InputJsonValue,
        },
      })
    }

    return this.getDomain(companyId, domain)
  }
}

export const settingsService = new SettingsService()
