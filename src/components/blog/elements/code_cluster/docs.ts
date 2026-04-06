import type { ElementDocs } from '../docs-types'
import { codeClusterExample } from './example'

export const codeClusterDocs: ElementDocs = {
  label: 'Code Block',
  description: 'Code snippet with description and language identifier.',
  fields: [
    { name: 'title', type: 'string', description: 'Block heading.' },
    { name: 'description', type: 'string', description: 'Explanation of the code.' },
    { name: 'code', type: 'string', required: true, description: 'The code content.' },
    { name: 'language', type: 'string', description: 'Language identifier (e.g. "json", "javascript").' },
  ],
  example: codeClusterExample,
  hyperlinkFields: ['title', 'description'],
}
