/**
 * tsx `--import` preload hook that stubs `server-only` so scripts that transitively
 * import `@/lib/vault` can run outside the Next bundler. No-op at runtime.
 */
import { Module } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const stubPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'server-only-stub.cjs')

const originalResolve = Module._resolveFilename
Module._resolveFilename = function (request, ...rest) {
  if (request === 'server-only') return stubPath
  return originalResolve.call(this, request, ...rest)
}
