import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Do NOT use trailingSlash — the catch-all route normalizes paths instead.
  // skipTrailingSlashRedirect prevents Next.js from 308-redirecting /api/aurora/foo/ → /api/aurora/foo
  skipTrailingSlashRedirect: true,
  allowedDevOrigins: ['192.168.50.42', '127.0.0.1', 'localhost'],

  async rewrites() {
    return [
      // Phase II: explicit legacy namespace alias (no breaking changes)
      {
        source: '/api/legacy/aurora/:path*',
        destination: '/api/aurora/:path*',
      },
    ]
  },

  // Allow LAN access (e.g. 192.168.x.x:4000)
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,PATCH,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type,Authorization,Company-ID' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
    ]
  },
};

export default nextConfig;
