/**
 * Lightweight website scraper.
 *
 * Fetches 3-5 key pages from a website and extracts readable text.
 * No heavy dependencies — uses built-in fetch + basic HTML stripping.
 */

const TIMEOUT_MS = 10_000
const MAX_BODY_CHARS = 30_000
const MAX_PAGES = 5

/** Pages we try to find, in priority order */
const CANDIDATE_PATHS = [
  '/',
  '/about',
  '/about-us',
  '/services',
  '/products',
  '/what-we-do',
  '/blog',
]

function normalizeUrl(input: string): string {
  let url = input.trim()
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`
  return url.replace(/\/+$/, '')
}

function stripHtml(html: string): string {
  return html
    // Remove script/style/noscript/svg blocks entirely
    .replace(/<(script|style|noscript|svg|nav|footer|header)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    // Remove all HTML tags
    .replace(/<[^>]+>/g, ' ')
    // Decode common entities
    .replace(/&(nbsp|amp|lt|gt|quot|#39);/gi, (_, entity) => {
      const map: Record<string, string> = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" }
      return map[entity.toLowerCase()] ?? _
    })
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  return match ? stripHtml(match[1]).slice(0, 200) : ''
}

function extractMeta(html: string, name: string): string {
  const re = new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i')
  const match = html.match(re)
  if (match) return match[1].trim()

  // Try reversed attribute order
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${name}["']`, 'i')
  const match2 = html.match(re2)
  return match2 ? match2[1].trim() : ''
}

async function fetchPage(url: string): Promise<{ url: string; html: string } | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OpenSEOBot/1.0; +https://openseo.ai)',
        Accept: 'text/html',
      },
      redirect: 'follow',
    })

    clearTimeout(timeout)

    if (!res.ok) return null

    const contentType = res.headers.get('content-type') ?? ''
    if (!contentType.includes('text/html')) return null

    const html = await res.text()
    return { url, html }
  } catch {
    return null
  }
}

export type ScrapedPage = {
  url: string
  title: string
  description: string
  text: string
}

export type ScrapeResult = {
  baseUrl: string
  pages: ScrapedPage[]
}

/**
 * Scrape key pages from a website.
 * Returns extracted text from up to MAX_PAGES pages.
 */
export async function scrapeWebsite(websiteUrl: string): Promise<ScrapeResult> {
  const base = normalizeUrl(websiteUrl)
  const pages: ScrapedPage[] = []

  const homepage = await fetchPage(base)
  if (!homepage) {
    // Try with www
    const withWww = base.replace('://', '://www.')
    const homepageRetry = await fetchPage(withWww)
    if (!homepageRetry) {
      return { baseUrl: base, pages: [] }
    }
    return scrapeFromHomepage(withWww, homepageRetry, pages)
  }

  return scrapeFromHomepage(base, homepage, pages)
}

async function scrapeFromHomepage(
  base: string,
  homepage: { url: string; html: string },
  pages: ScrapedPage[],
): Promise<ScrapeResult> {
  pages.push({
    url: homepage.url,
    title: extractTitle(homepage.html),
    description: extractMeta(homepage.html, 'description') || extractMeta(homepage.html, 'og:description'),
    text: stripHtml(homepage.html).slice(0, MAX_BODY_CHARS),
  })

  const internalLinks = extractInternalLinks(homepage.html, base)

  const candidates: string[] = []
  for (const path of CANDIDATE_PATHS.slice(1)) {
    const match = internalLinks.find((link) =>
      link.toLowerCase().includes(path.replace('/', ''))
    )
    candidates.push(match || `${base}${path}`)
  }

  const results = await Promise.all(
    candidates.slice(0, MAX_PAGES - 1).map((url) => fetchPage(url))
  )

  for (const result of results) {
    if (!result) continue
    if (pages.length >= MAX_PAGES) break

    const text = stripHtml(result.html).slice(0, MAX_BODY_CHARS)
    if (text.length < 100) continue // Skip near-empty pages

    pages.push({
      url: result.url,
      title: extractTitle(result.html),
      description: extractMeta(result.html, 'description') || extractMeta(result.html, 'og:description'),
      text,
    })
  }

  return { baseUrl: base, pages }
}

function extractInternalLinks(html: string, base: string): string[] {
  const links: string[] = []
  const re = /href=["']([^"']+)["']/gi
  let match

  while ((match = re.exec(html)) !== null) {
    const href = match[1]
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue

    try {
      const resolved = new URL(href, base)
      if (resolved.origin === new URL(base).origin) {
        links.push(resolved.href)
      }
    } catch {
      // Invalid URL, skip
    }
  }

  return [...new Set(links)]
}
