import { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4720'

/**
 * Robots policy.
 *
 * Allowed: the public marketing surface (`/landing`, `/landing/*`) and the
 * public content surface (`/site/*`). Everything else is explicitly denied so
 * that crawlers never even request private URLs.
 *
 * Note: `/` is the authenticated dashboard home under the `(dashboard)` route
 * group. We cannot disallow `/` without blocking the whole site, so the
 * dashboard home relies on the `noindex` meta tag emitted by its layout.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/landing', '/landing/', '/site/'],
        disallow: [
          // API
          '/api/',
          // Auth flows
          '/login',
          '/register',
          '/forgot-password',
          '/setup',
          // Dashboard top-level segments (real URLs, not the `(dashboard)` group name)
          '/admin',
          '/analytics',
          '/blog',
          '/dictionary',
          '/elements',
          '/publishing',
          '/company-profile',
          '/settings',
          // Gated content
          '/preview/',
          '/share/',
          // Demo pages (see plan Task 0 decision)
          '/example/',
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  }
}
