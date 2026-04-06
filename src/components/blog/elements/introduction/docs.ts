import type { ElementDocs } from '../docs-types'
import { introductionExample } from './example'

export const introductionDocs: ElementDocs = {
  label: 'Introduction',
  description: 'Opening section of a post.',
  fields: [
    { name: 'title', type: 'string', description: 'Heading. Defaults to "Introduction" if absent.' },
    { name: 'text', type: 'string', required: true, description: 'Introduction body text.' },
  ],
  example: introductionExample,
  hyperlinkFields: ['text'],
}
