import type { ElementDocs } from '../docs-types'
import { tableExample } from './example'

export const tableDocs: ElementDocs = {
  label: 'Table',
  description: 'Data table with headers and rows.',
  fields: [
    { name: 'title', type: 'string', description: 'Table heading.' },
    { name: 'text_before', type: 'string', description: 'Paragraph before the table.' },
    { name: 'headers', type: 'string[]', required: true, description: 'Column header labels.' },
    { name: 'rows', type: 'string[][]', required: true, description: '2D array of cell values. Each inner array is one row.' },
    { name: 'text_after', type: 'string', description: 'Paragraph after the table.' },
  ],
  example: tableExample,
  hyperlinkFields: ['title', 'text_before', 'headers', 'rows', 'text_after'],
}
