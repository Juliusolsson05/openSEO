import type { ElementDocs } from '../docs-types'
import { barChartExample } from './example'

export const barChartDocs: ElementDocs = {
  label: 'Bar Chart',
  description: 'Horizontal bar chart data. Render with any charting library.',
  fields: [
    { name: 'title', type: 'string', required: true, description: 'Chart title.' },
    { name: 'text_before', type: 'string', description: 'Intro text.' },
    { name: 'bars', type: 'Array<{label, value}>', required: true, description: 'Each bar: label (string), value (number, typically 0-100).' },
    { name: 'text_after', type: 'string', description: 'Closing text.' },
  ],
  example: barChartExample,
  hyperlinkFields: ['title', 'text_before', 'bars.label', 'text_after'],
}
