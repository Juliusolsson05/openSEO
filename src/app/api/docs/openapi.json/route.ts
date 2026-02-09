/**
 * GET /api/docs/openapi.json
 *
 * Serves the OpenAPI 3.1 specification as JSON.
 */

import { NextResponse } from 'next/server'
import { spec } from '@/lib/openapi'

export const dynamic = 'force-static'

export function GET() {
  return NextResponse.json(spec, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
