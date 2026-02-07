import { z } from 'zod'

const internalLinkSchema = z.string().startsWith('/', 'CTA link must start with /')

export const createCampaignSchema = z.object({
  name: z.string().min(1).max(255),
})

export const updateCampaignSchema = createCampaignSchema.partial()

export const createCtaSchema = z.object({
  campaignId: z.number().int().positive(),
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  link: internalLinkSchema,
  image: z.string().min(1).optional(),
  generateImage: z.boolean().optional().default(false),
})

export const updateCtaSchema = z.object({
  campaignId: z.number().int().positive().optional(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  link: internalLinkSchema.optional(),
  image: z.string().min(1).optional(),
  generateImage: z.boolean().optional(),
})

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>
export type CreateCtaInput = z.infer<typeof createCtaSchema>
export type UpdateCtaInput = z.infer<typeof updateCtaSchema>
