import { ZodError, ZodType } from 'zod'

import { ValidationError } from '@/server/api/errors'

export function validate<T>(schema: ZodType<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError('Invalid request data', error.flatten())
    }

    throw error
  }
}
