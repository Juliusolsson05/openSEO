import type { ElementDocs } from '../docs-types'
import { conclusionExample } from './example'

export const conclusionDocs: ElementDocs = {
  label: 'Conclusion',
  description: 'Closing section of a post.',
  fields: [
    { name: 'title', type: 'string', description: 'Heading. Defaults to "Conclusion" if absent.' },
    { name: 'text', type: 'string', required: true, description: 'Conclusion body text.' },
  ],
  example: conclusionExample,
  hyperlinkFields: ['text'],
}
