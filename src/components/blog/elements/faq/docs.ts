import type { ElementDocs } from '../docs-types'
import { faqExample } from './example'

export const faqDocs: ElementDocs = {
  label: 'FAQ',
  description: 'Question/answer pairs. Supports per-item hyperlinks.',
  fields: [
    { name: 'title', type: 'string', description: 'Section heading. Defaults to "FAQ".' },
    { name: 'items', type: 'Array<{question, answer}>', required: true, description: 'Each item has question (string) and answer (string).' },
  ],
  example: faqExample as unknown as Record<string, unknown>,
  hyperlinkFields: ['items.question', 'items.answer'],
  legacyNotes: 'Older content may store FAQs as a bare array instead of {title, items}. Normalize by checking Array.isArray(content) and wrapping: {title: "FAQ", items: content}.',
}
