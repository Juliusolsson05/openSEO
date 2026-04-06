import type { ElementDocs } from '../docs-types'
import { paragraphExample } from './example'

export const paragraphDocs: ElementDocs = {
  label: 'Paragraph',
  description: 'Standard text block with optional heading. The most common element type.',
  fields: [
    { name: 'title', type: 'string', description: 'Section heading. May be absent for body paragraphs.' },
    { name: 'text', type: 'string', required: true, description: 'Paragraph body text. May contain light HTML.' },
  ],
  example: paragraphExample,
  hyperlinkFields: ['title', 'text'],
}
