import { BlogPostElementType } from '@prisma/client'
import { z } from 'zod'

export const addElementSchema = z.object({
  blogPostId: z.coerce.number().int().positive(),
  elementType: z.nativeEnum(BlogPostElementType),
  order: z.coerce.number().int().min(0).optional(),
  content: z.any(),
})

export const updateElementSchema = z
  .object({
    elementType: z.nativeEnum(BlogPostElementType).optional(),
    order: z.coerce.number().int().min(0).optional(),
    content: z.any().optional(),
  })
  .refine((value) => value.elementType !== undefined || value.order !== undefined || value.content !== undefined, {
    message: 'At least one field is required',
  })

export type AddElementInput = z.infer<typeof addElementSchema>
export type UpdateElementInput = z.infer<typeof updateElementSchema>
