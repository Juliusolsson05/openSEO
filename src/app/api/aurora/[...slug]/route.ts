import { apiHandler } from '@/server/api/handler'
import { error, raw } from '@/server/api/response'

function methodNotImplemented(path: string) {
  return error(`Endpoint not implemented yet: /api/aurora/${path}`, 501)
}

function getSlugParts(params: Record<string, unknown>): string[] {
  const rawSlug = params.slug
  if (Array.isArray(rawSlug)) return rawSlug.map(String)
  if (typeof rawSlug === 'string') return rawSlug.split('/').filter(Boolean)
  return []
}

const routeHandler = apiHandler(async (ctx) => {
  const path = getSlugParts(ctx.params).join('/')

  if (path === 'health' || path === 'health/celery') {
    return raw({ detail: 'Not found.' }, 404)
  }

  return methodNotImplemented(path)
})

export const GET = routeHandler
export const POST = routeHandler
export const PUT = routeHandler
export const DELETE = routeHandler
