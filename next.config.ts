import type { NextConfig } from "next";

// CORS / dev-origin config is driven entirely by env so we never ship a
// personal LAN IP or a wildcard origin in the repo.
//
//   ALLOWED_ORIGINS       Comma-separated list of origins allowed to call
//                         /api/* with credentials. Example:
//                           ALLOWED_ORIGINS=https://app.example.com,https://example.com
//                         In dev this defaults to localhost:3000 + localhost:4720
//                         if unset.
//   ALLOWED_DEV_ORIGINS   Comma-separated hostnames/IPs to trust for Next.js
//                         dev-server cross-origin warnings (LAN testing).
//                         Example: ALLOWED_DEV_ORIGINS=192.168.1.154,10.0.0.5
//                         In dev this defaults to localhost + 127.0.0.1 if unset.
const isDev = process.env.NODE_ENV !== 'production'

const parseList = (raw: string | undefined): string[] =>
  (raw ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

const allowedOrigins: string[] = (() => {
  const fromEnv = parseList(process.env.ALLOWED_ORIGINS)
  if (fromEnv.length > 0) return fromEnv
  if (isDev) return ['http://localhost:3000', 'http://localhost:4720']
  return [] // prod with no ALLOWED_ORIGINS => no CORS headers emitted
})()

const allowedDevOrigins: string[] = (() => {
  const fromEnv = parseList(process.env.ALLOWED_DEV_ORIGINS)
  if (fromEnv.length > 0) return fromEnv
  return ['localhost', '127.0.0.1']
})()

const nextConfig: NextConfig = {
  // Do NOT use trailingSlash — the catch-all route normalizes paths instead.
  // skipTrailingSlashRedirect prevents Next.js from 308-redirecting
  // /api/aurora/foo/ → /api/aurora/foo
  skipTrailingSlashRedirect: true,
  allowedDevOrigins,

  async rewrites() {
    return [
      // Phase II: explicit legacy namespace alias (no breaking changes)
      {
        source: '/api/legacy/aurora/:path*',
        destination: '/api/aurora/:path*',
      },
    ]
  },

  // CORS for /api/*.
  //
  // The spec forbids `Access-Control-Allow-Origin: *` combined with
  // `Access-Control-Allow-Credentials: true`, and our client uses cookie
  // auth, so we MUST emit a specific origin. Next.js static `headers()`
  // can't vary by request, so when multiple origins are allowed we emit
  // the first one as a stable default and rely on same-origin fetches for
  // the rest (the browser will short-circuit same-origin requests anyway).
  //
  // If you need true per-request origin matching across a multi-origin
  // allowlist, do it in `middleware.ts` by reading the `Origin` header and
  // echoing it back when it's in `allowedOrigins`. That's out of scope here.
  async headers() {
    if (allowedOrigins.length === 0) return []
    const primaryOrigin = allowedOrigins[0]
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: primaryOrigin },
          { key: 'Vary', value: 'Origin' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,PATCH,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type,Authorization,Company-ID' },
        ],
      },
    ]
  },
};

export default nextConfig;
