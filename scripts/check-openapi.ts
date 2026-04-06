#!/usr/bin/env tsx
/**
 * check-openapi.ts
 *
 * Asserts every path documented in src/lib/openapi.ts maps to a real
 * route.ts under src/app/api. Exits 1 on drift.
 *
 * Run: npx tsx scripts/check-openapi.ts
 */
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { spec } from '../src/lib/openapi'

const API_ROOT = resolve(__dirname, '..', 'src', 'app', 'api')

/** Convert an OpenAPI path template to the filesystem form used by Next.js. */
function openapiPathToRouteFile(p: string): string {
  // Strip a leading /api if present — routes live under src/app/api already.
  const stripped = p.replace(/^\/api/, '')
  // {param} -> [param], {...slug} -> [...slug]
  const segments = stripped
    .split('/')
    .filter(Boolean)
    .map((seg) => {
      const m = seg.match(/^\{(\.\.\.)?([^}]+)\}$/)
      if (!m) return seg
      return m[1] ? `[...${m[2]}]` : `[${m[2]}]`
    })
  return join(API_ROOT, ...segments, 'route.ts')
}

const paths = Object.keys((spec as { paths: Record<string, unknown> }).paths ?? {})
const missing: string[] = []

for (const p of paths) {
  const file = openapiPathToRouteFile(p)
  if (!existsSync(file)) {
    missing.push(`${p}  ->  ${file}`)
  }
}

if (missing.length > 0) {
  console.error(
    `OpenAPI drift: ${missing.length} documented path(s) have no route.ts:\n`,
  )
  for (const m of missing) console.error('  ' + m)
  console.error(
    '\nFix: either add the route or remove the entry from src/lib/openapi.ts.',
  )
  process.exit(1)
}

console.log(`OK: all ${paths.length} documented paths resolve to a route.ts`)
