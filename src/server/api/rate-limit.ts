import type { NextRequest } from 'next/server'

import { AppError } from '@/server/api/errors'

/**
 * Minimal in-memory fixed-window rate limiter.
 *
 * WARNING: This limiter is process-local and lossy across restarts. It is a
 * defensive starting point for unauthenticated endpoints (login, register,
 * setup/*). It does NOT coordinate across multiple app instances.
 *
 * TODO: Upgrade to a Redis-backed (or @upstash/ratelimit) implementation when
 * a Redis client becomes part of the runtime dependency set. The repo
 * references REDIS_URL in docker-compose/.env.example but has no Redis
 * client in package.json as of this change.
 */

export type RateLimitBucket = {
  /** Bucket name, e.g. 'auth' or 'setup'. Isolates counters. */
  name: string
  /** Max requests per window per client. */
  limit: number
  /** Window size in milliseconds. */
  windowMs: number
}

type Counter = { count: number; windowStart: number }

const store = new Map<string, Counter>()

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) {
    const first = xff.split(',')[0]?.trim()
    if (first) return first
  }
  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp
  // NextRequest.ip is populated on Vercel/edge; fall back to a sentinel so
  // unknown callers still share a bucket rather than bypass the limiter.
  const anyReq = req as unknown as { ip?: string | null }
  return anyReq.ip ?? 'unknown'
}

export type RateLimitResult =
  | { ok: true; remaining: number; resetAt: number }
  | { ok: false; retryAfterSeconds: number; resetAt: number }

export function checkRateLimit(req: NextRequest, bucket: RateLimitBucket): RateLimitResult {
  const ip = getClientIp(req)
  const key = `${bucket.name}:${ip}`
  const now = Date.now()

  const existing = store.get(key)
  if (!existing || now - existing.windowStart >= bucket.windowMs) {
    store.set(key, { count: 1, windowStart: now })
    return { ok: true, remaining: bucket.limit - 1, resetAt: now + bucket.windowMs }
  }

  if (existing.count >= bucket.limit) {
    const resetAt = existing.windowStart + bucket.windowMs
    const retryAfterSeconds = Math.max(1, Math.ceil((resetAt - now) / 1000))
    return { ok: false, retryAfterSeconds, resetAt }
  }

  existing.count += 1
  store.set(key, existing)
  return {
    ok: true,
    remaining: bucket.limit - existing.count,
    resetAt: existing.windowStart + bucket.windowMs,
  }
}

/** Throws TooManyRequestsError if the request exceeds the bucket. */
export function enforceRateLimit(req: NextRequest, bucket: RateLimitBucket): void {
  const result = checkRateLimit(req, bucket)
  if (!result.ok) {
    throw new TooManyRequestsError(
      `Too many requests. Retry in ${result.retryAfterSeconds}s.`,
      result.retryAfterSeconds,
    )
  }
}

export class TooManyRequestsError extends AppError {
  public readonly retryAfterSeconds: number

  constructor(message = 'Too many requests', retryAfterSeconds: number) {
    super(message, 429, { retryAfterSeconds }, 'RATE_LIMITED')
    this.retryAfterSeconds = retryAfterSeconds
  }
}

/** Pre-baked bucket configs used by unauth routes. Tweak freely. */
export const RATE_LIMIT_BUCKETS = {
  /** Login + register — tight budget per IP. */
  auth: { name: 'auth', limit: 10, windowMs: 60_000 } satisfies RateLimitBucket,
  /** Setup wizard — very tight, should only be hit during first-run. */
  setup: { name: 'setup', limit: 20, windowMs: 60_000 } satisfies RateLimitBucket,
} as const

/** Test-only helper. Not exported from barrel files. */
export function resetRateLimitStoreForTests(): void {
  store.clear()
}
