import { z } from 'zod'

export const analyticsQuerySchema = z.object({
  refresh: z.coerce.boolean().optional(),
})

export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>
