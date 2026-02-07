import { z } from 'zod'

export const createBulkScheduleSchema = z.object({
  name: z.string().min(1).max(255),
  startDate: z.string().datetime().optional(),
  intervalDays: z.number().int().min(1).optional(),
})

export const updateBulkScheduleSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    startDate: z.string().datetime().nullable().optional(),
    intervalDays: z.number().int().min(1).nullable().optional(),
  })
  .refine((value) => value.name !== undefined || value.startDate !== undefined || value.intervalDays !== undefined, {
    message: 'At least one field is required',
  })

export const assignToBulkSchema = z.object({
  titleIds: z.array(z.number().int().positive()).min(1),
  bulkScheduleId: z.number().int().positive(),
})

export const removeFromBulkSchema = z.object({
  titleIds: z.array(z.number().int().positive()).min(1),
})

export const schedulePostSchema = z.object({
  date: z.string().datetime(),
})

export const scheduleByIntervalSchema = z.object({
  titleIds: z.array(z.number().int().positive()).min(1),
  startDate: z.string().datetime(),
  intervalDays: z.number().int().min(1),
})

export type CreateBulkScheduleInput = z.infer<typeof createBulkScheduleSchema>
export type UpdateBulkScheduleInput = z.infer<typeof updateBulkScheduleSchema>
export type AssignToBulkInput = z.infer<typeof assignToBulkSchema>
export type RemoveFromBulkInput = z.infer<typeof removeFromBulkSchema>
export type SchedulePostInput = z.infer<typeof schedulePostSchema>
export type ScheduleByIntervalInput = z.infer<typeof scheduleByIntervalSchema>
