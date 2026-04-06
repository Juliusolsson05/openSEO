/**
 * Shared helpers for resolving media/image URLs and extracting domains.
 * Single source of truth — do NOT reinvent these in element components.
 */

/**
 * Resolve a media path to a fully-qualified URL.
 *
 * Rules:
 *   - null/undefined/empty → ''
 *   - absolute URL (http://, https://, data:) → returned unchanged
 *   - path starting with '/' → `${base}${path}` (NO /media/ injection)
 *   - bare/relative path → `${base}/media/${path}`
 *
 * The base URL comes from `NEXT_PUBLIC_API_BASE_URL`; trailing slashes
 * are stripped. If the env var is unset, the function returns a
 * site-relative URL.
 */
export function resolveMediaUrl(path: string | null | undefined): string {
  if (!path) return ''

  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:')
  ) {
    return path
  }

  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/+$/, '')

  if (path.startsWith('/')) {
    return `${base}${path}`
  }

  return `${base}/media/${path}`
}

/**
 * Extract the hostname from a URL. Returns '' for empty or invalid input.
 * Unlike a regex strip, this correctly removes path, query, fragment, port, etc.
 *
 * Example: extractDomain('https://example.com/path?q=1') === 'example.com'
 */
export function extractDomain(url: string | null | undefined): string {
  if (!url) return ''
  try {
    // Prepend protocol if missing so URL constructor can parse it.
    const normalized = url.includes('://') ? url : `https://${url}`
    return new URL(normalized).hostname
  } catch {
    return ''
  }
}
