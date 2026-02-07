import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Do NOT use trailingSlash — the catch-all route normalizes paths instead.
  // skipTrailingSlashRedirect prevents Next.js from 308-redirecting /api/aurora/foo/ → /api/aurora/foo
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
