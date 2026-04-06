import type { ElementDocs } from '../docs-types'
import { numberedListParagraphExample } from './example'

export const numberedListParagraphDocs: ElementDocs = {
  label: 'Numbered List',
  description: 'Ordered list with optional surrounding text.',
  fields: [
    { name: 'title', type: 'string', description: 'Section heading.' },
    { name: 'text_before_list', type: 'string', description: 'Introductory paragraph.' },
    { name: 'list_items', type: 'string[]', required: true, description: 'Numbered list items.' },
    { name: 'text_after_list', type: 'string', description: 'Closing paragraph.' },
  ],
  example: numberedListParagraphExample,
  hyperlinkFields: ['title', 'text_before_list', 'list_items', 'text_after_list'],
}
