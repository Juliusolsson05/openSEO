import { z } from 'zod'

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export const companyIdSchema = z.object({
  companyId: z.coerce.number().int().positive(),
})
