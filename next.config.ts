import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Do NOT use trailingSlash — the catch-all route normalizes paths instead.
  // skipTrailingSlashRedirect prevents Next.js from 308-redirecting /api/aurora/foo/ → /api/aurora/foo
  skipTrailingSlashRedirect: true,
  allowedDevOrigins: ['192.168.1.154', '127.0.0.1', 'localhost'],

  async rewrites() {
    return [
      // Phase II: explicit legacy namespace alias (no breaking changes)
      {
        source: '/api/legacy/aurora/:path*',
        destination: '/api/aurora/:path*',
      },
    ]
  },

  // Allow LAN access (e.g. 192.168.x.x:4720)
  // Note: Allow-Origin: * with Allow-Credentials: true is invalid per spec.
  // In production, set FRONTEND_URL to the actual origin.
  async headers() {
    const origin = process.env.FRONTEND_URL || '*'
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: origin },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,PATCH,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type,Authorization,Company-ID' },
          ...(origin !== '*' ? [{ key: 'Access-Control-Allow-Credentials', value: 'true' }] : []),
        ],
      },
    ]
  },
};

export default nextConfig;
