import type { ElementDocs } from '../docs-types'
import { checklistExample } from './example'

export const checklistDocs: ElementDocs = {
  label: 'Checklist',
  description: 'Actionable checklist with optional details per item.',
  fields: [
    { name: 'title', type: 'string', description: 'Checklist heading.' },
    { name: 'introduction', type: 'string', description: 'Intro paragraph.' },
    { name: 'items', type: 'Array<{action, details?, checked?}>', required: true, description: 'Each item: action (string, required), details (string, optional), checked (boolean, default false).' },
    { name: 'conclusion', type: 'string', description: 'Closing paragraph.' },
  ],
  example: checklistExample,
  hyperlinkFields: ['title', 'introduction', 'items.action', 'items.details', 'conclusion'],
}
