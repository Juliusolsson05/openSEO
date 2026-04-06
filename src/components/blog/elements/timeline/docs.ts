import type { ElementDocs } from '../docs-types'
import { timelineExample } from './example'

export const timelineDocs: ElementDocs = {
  label: 'Timeline',
  description: 'Chronological events.',
  fields: [
    { name: 'title', type: 'string', description: 'Timeline heading.' },
    { name: 'text_before', type: 'string', description: 'Intro text.' },
    { name: 'events', type: 'Array<{date?, title, description}>', required: true, description: 'Chronological entries.' },
    { name: 'text_after', type: 'string', description: 'Closing text.' },
  ],
  example: timelineExample,
  hyperlinkFields: ['title', 'text_before', 'events.title', 'events.description', 'text_after'],
}
