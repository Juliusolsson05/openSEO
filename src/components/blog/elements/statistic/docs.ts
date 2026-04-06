import type { ElementDocs } from '../docs-types'
import { statisticExample } from './example'

export const statisticDocs: ElementDocs = {
  label: 'Statistic',
  description: 'Highlighted metric with label and description.',
  fields: [
    { name: 'title', type: 'string', description: 'Context heading.' },
    { name: 'value', type: 'string', required: true, description: 'The stat value (e.g. "47%", "3.2x").' },
    { name: 'label', type: 'string', description: 'Short label for the stat.' },
    { name: 'description', type: 'string', description: 'Longer explanation.' },
  ],
  example: statisticExample,
  hyperlinkFields: ['title', 'description'],
}
