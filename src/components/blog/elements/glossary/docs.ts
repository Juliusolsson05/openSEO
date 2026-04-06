import type { ElementDocs } from '../docs-types'
import { glossaryExample } from './example'

export const glossaryDocs: ElementDocs = {
  label: 'Glossary',
  description: 'Term/definition list.',
  fields: [
    { name: 'title', type: 'string', description: 'Glossary heading.' },
    { name: 'items', type: 'Array<{term, definition}>', required: true, description: 'Term/definition pairs.' },
  ],
  example: glossaryExample,
}
