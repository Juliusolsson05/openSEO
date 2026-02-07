import { prisma } from '@/lib/prisma'
import { apiHandler } from '@/server/api/handler'
import { raw } from '@/server/api/response'
import { ValidationError } from '@/server/api/errors'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const handler = apiHandler(async (ctx) => {
  if (ctx.body === undefined) {
    const invitedEmails = await prisma.user.findMany({
      where: { password: null },
      select: {
        id: true,
        email: true,
      },
      orderBy: { email: 'asc' },
      take: 500,
    })

    return raw({ data: invitedEmails })
  }

  const body = (ctx.body ?? {}) as Record<string, unknown>
  const email = String(body.email ?? '').trim().toLowerCase()

  if (!emailRegex.test(email)) {
    throw new ValidationError('Please provide a valid email address')
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return raw({ detail: 'This email is already in use or already invited' }, 409)
  }

  const invite = await prisma.user.create({
    data: {
      email,
      password: null,
      userType: 'CLIENT',
      companyId: null,
    },
    select: {
      id: true,
      email: true,
    },
  })

  return raw({ invited: invite }, 201)
}, { admin: true })

export const GET = handler
export const POST = handler
