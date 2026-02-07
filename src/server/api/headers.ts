import { NextResponse } from 'next/server'

export function withRequestId<T extends NextResponse>(response: T, requestId: string): T {
  response.headers.set('x-request-id', requestId)
  return response
}

export function withDeprecation<T extends NextResponse>(
  response: T,
  opts: { sunset?: string; docsUrl?: string },
): T {
  response.headers.set('deprecation', 'true')
  if (opts.sunset) response.headers.set('sunset', opts.sunset)
  if (opts.docsUrl) response.headers.set('link', `<${opts.docsUrl}>; rel="deprecation"`)
  return response
}
