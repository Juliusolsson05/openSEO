import type { ElementDocs } from '../docs-types'
import { snippetBlockExample } from './example'

export const snippetBlockDocs: ElementDocs = {
  label: 'Featured Snippet',
  description: 'Google snippet-optimized block with concise answer text.',
  fields: [
    { name: 'title', type: 'string', description: 'Snippet heading (usually a question).' },
    { name: 'text', type: 'string', required: true, description: 'The concise answer text.' },
  ],
  example: snippetBlockExample,
  hyperlinkFields: ['title', 'text'],
}
