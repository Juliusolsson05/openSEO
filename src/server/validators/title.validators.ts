import { TitleStatus } from '@prisma/client'
import { z } from 'zod'

export const listTitlesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(1000).default(50),
  status: z.nativeEnum(TitleStatus).optional(),
  search: z.string().optional(),
})

export const createTitleSchema = z.object({
  titleText: z.string().min(3).max(255),
  seoTitle: z.string().min(3).max(255).optional(),
  focusKeyword: z.string().min(2).max(255).optional(),
  categoryIds: z.array(z.number().int().positive()).optional(),
})

export const updateTitleSchema = createTitleSchema
  .extend({
    status: z.nativeEnum(TitleStatus).optional(),
    seoTitle: z.string().min(3).max(255).nullable().optional(),
    focusKeyword: z.string().min(2).max(255).nullable().optional(),
  })
  .partial()

export type ListTitlesQueryInput = z.infer<typeof listTitlesQuerySchema>
export type CreateTitleInput = z.infer<typeof createTitleSchema>
export type UpdateTitleInput = z.infer<typeof updateTitleSchema>
