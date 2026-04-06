import type { ElementDocs } from '../docs-types'
import { versusExample } from './example'

export const versusDocs: ElementDocs = {
  label: 'Versus',
  description: 'Side-by-side comparison with criteria.',
  fields: [
    { name: 'title', type: 'string', description: 'Comparison heading.' },
    { name: 'text_before', type: 'string', description: 'Intro text.' },
    { name: 'competitors', type: 'string[]', required: true, description: 'Names of the options being compared.' },
    { name: 'criteria', type: 'Array<{name, winner, details[]}>', required: true, description: 'Each criterion: name (string), winner (string), details (string[] — one per competitor).' },
    { name: 'text_after', type: 'string', description: 'Closing text.' },
  ],
  example: versusExample,
  hyperlinkFields: ['title', 'text_before', 'competitors', 'criteria.name', 'criteria.details', 'text_after'],
}
