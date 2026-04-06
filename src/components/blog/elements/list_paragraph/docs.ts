import type { ElementDocs } from '../docs-types'
import { listParagraphExample } from './example'

export const listParagraphDocs: ElementDocs = {
  label: 'List Paragraph',
  description: 'Bulleted list with optional surrounding text.',
  fields: [
    { name: 'title', type: 'string', description: 'Section heading.' },
    { name: 'text_before_list', type: 'string', description: 'Introductory paragraph before the list.' },
    { name: 'list_items', type: 'string[]', required: true, description: 'Bulleted list items.' },
    { name: 'text_after_list', type: 'string', description: 'Closing paragraph after the list.' },
  ],
  example: listParagraphExample,
  hyperlinkFields: ['title', 'text_before_list', 'list_items', 'text_after_list'],
}
