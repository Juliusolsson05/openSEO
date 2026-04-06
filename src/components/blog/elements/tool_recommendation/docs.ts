import type { ElementDocs } from '../docs-types'
import { toolRecommendationExample } from './example'

export const toolRecommendationDocs: ElementDocs = {
  label: 'Tool Recommendation',
  description: 'Product/tool card with features and pricing.',
  fields: [
    { name: 'title', type: 'string', required: true, description: 'Tool name.' },
    { name: 'companyWebsite', type: 'string', description: 'Tool website URL.' },
    { name: 'pricing', type: 'string', description: 'Pricing info (free text).' },
    { name: 'productDescription', type: 'string', description: 'Description of the tool.' },
    { name: 'features', type: 'string[]', description: 'Key feature list.' },
    { name: 'headerColor', type: 'string', description: 'Hex color for the card header.' },
  ],
  example: toolRecommendationExample,
  hyperlinkFields: ['title', 'pricing', 'productDescription', 'features'],
}
