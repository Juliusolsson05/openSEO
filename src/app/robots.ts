import { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://aurora.nordtools.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/landing', '/site/', '/landing/about', '/landing/contact', '/landing/compare'],
        disallow: ['/example/', '/api/', '/login', '/register', '/(dashboard)/'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  }
}
