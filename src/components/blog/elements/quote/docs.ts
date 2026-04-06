import type { ElementDocs } from '../docs-types'
import { quoteExample } from './example'

export const quoteDocs: ElementDocs = {
  label: 'Quote',
  description: 'Attributed quotation.',
  fields: [
    { name: 'quote', type: 'string', required: true, description: 'The quote text.' },
    { name: 'person', type: 'string', required: true, description: 'Who said it.' },
    { name: 'description', type: 'string', description: 'Context about the person (title, company).' },
  ],
  example: quoteExample,
  hyperlinkFields: ['quote', 'person', 'description'],
}
