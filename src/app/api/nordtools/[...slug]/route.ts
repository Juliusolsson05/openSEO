import { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import { apiHandler } from '@/server/api/handler'
import { NotFoundError, ValidationError } from '@/server/api/errors'
import { error, raw } from '@/server/api/response'

function getSlugParts(params: Record<string, unknown>): string[] {
  const value = params.slug
  if (Array.isArray(value)) return value.map(String)
  if (typeof value === 'string') return value.split('/').filter(Boolean)
  return []
}

function methodNotImplemented(path: string) {
  return error(`Endpoint not implemented yet: /api/nordtools/${path}`, 501)
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

async function getCompany(companyId: number) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  })

  if (!company) {
    throw new NotFoundError('Company not found')
  }

  return company
}

const routeHandler = apiHandler(async (ctx) => {
  if (!ctx.companyId) throw new NotFoundError('Missing company context')

  const slug = getSlugParts(ctx.params)
  const path = slug.join('/')

  if (path === 'company/get') {
    const company = await getCompany(ctx.companyId)
    return raw({
      ...company,
      id: company.id,
      name: company.name,
    })
  }

  if (path === 'settings') {
    const category = ctx.searchParams.get('category')
    if (!category) throw new ValidationError('Missing required query parameter: category')

    const company = await getCompany(ctx.companyId)
    const settings = asObject(company.settings)

    return raw({ settings: asObject(settings[category]) })
  }

  if (path === 'settings/update') {
    const category = ctx.searchParams.get('category')
    if (!category) throw new ValidationError('Missing required query parameter: category')

    const body = asObject(ctx.body)
    const nextSettings = asObject(body.settings)

    const company = await getCompany(ctx.companyId)
    const settings = asObject(company.settings)

    const updated = await prisma.company.update({
      where: { id: ctx.companyId },
      data: {
        settings: {
          ...settings,
          [category]: nextSettings,
        } as Prisma.InputJsonValue,
      },
      select: { settings: true },
    })

    return raw({ settings: asObject(asObject(updated.settings)[category]) })
  }

  return methodNotImplemented(path)
})

export const GET = routeHandler
export const POST = routeHandler
