import type { FAQContent, FAQItem } from '@/types/content-elements'

/**
 * Accepts any of:
 *   - { title, items: FAQItem[] }   (canonical)
 *   - FAQItem[]                      (legacy array-only shape)
 *   - null / undefined
 * Returns the canonical FAQContent.
 */
export const normalizeFaqContent = (value: unknown): FAQContent => {
  if (Array.isArray(value)) {
    return { title: 'FAQ', items: value as FAQItem[] }
  }
  const raw = (value ?? {}) as { title?: string; items?: FAQItem[] }
  return {
    title: raw.title ?? 'FAQ',
    items: Array.isArray(raw.items) ? raw.items : [],
  }
}
