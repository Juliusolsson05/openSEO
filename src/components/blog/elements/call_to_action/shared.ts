import { resolveMediaUrl } from '@/lib/media'

export type CallToActionContent = {
  image_url?: string
  target_url?: string
  title?: string
  // Legacy field aliases — kept for backward compatibility with older stored posts.
  image?: string
  link?: string
}

/** Prefer the canonical `image_url`, fall back to the legacy `image` field. */
export const getCtaImageUrl = (content: CallToActionContent | null | undefined): string =>
  content?.image_url ?? content?.image ?? ''

/** Prefer the canonical `target_url`, fall back to the legacy `link` field. */
export const getCtaTargetUrl = (content: CallToActionContent | null | undefined): string =>
  content?.target_url ?? content?.link ?? ''

/** Resolve image URL with legacy field fallback. */
export const resolveCtaImageUrl = (content: CallToActionContent | null | undefined): string =>
  resolveMediaUrl(getCtaImageUrl(content))
