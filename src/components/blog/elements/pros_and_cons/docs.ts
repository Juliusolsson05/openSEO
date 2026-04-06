import type { ElementDocs } from '../docs-types'
import { prosAndConsExample } from './example'

export const prosAndConsDocs: ElementDocs = {
  label: 'Pros and Cons',
  description: 'Two-column pro/con comparison.',
  fields: [
    { name: 'title', type: 'string', description: 'Section heading.' },
    { name: 'text_before', type: 'string', description: 'Intro text.' },
    { name: 'pros', type: 'string[]', required: true, description: 'List of advantages.' },
    { name: 'cons', type: 'string[]', required: true, description: 'List of disadvantages.' },
    { name: 'text_after', type: 'string', description: 'Closing text.' },
  ],
  example: prosAndConsExample,
  hyperlinkFields: ['title', 'text_before', 'pros', 'cons', 'text_after'],
}
