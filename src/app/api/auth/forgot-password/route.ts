import { z } from 'zod'

import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { validate } from '@/server/api/validate'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
})

export const POST = apiHandler(
  async (ctx) => {
    const { email } = validate(forgotPasswordSchema, ctx.body)

    // TODO: wire this up to a real password-reset flow (token + email send).
    // For now we only log the request so operators can see it in the server
    // logs. We intentionally always return 200 regardless of whether the
    // email is associated with an account, to avoid leaking account
    // existence to unauthenticated callers.
    console.info('[auth.forgot-password] reset requested', { email })

    return raw({ ok: true, status: 'placeholder' })
  },
  { auth: false },
)
