import type { ElementDocs } from '../docs-types'
import { productRecommendationsExample } from './example'

export const productRecommendationsDocs: ElementDocs = {
  label: 'Product Recommendations',
  description: 'Product cards with title, motivation, and optional image/price/tags.',
  fields: [
    { name: 'title', type: 'string', description: 'Section heading.' },
    { name: 'introduction', type: 'string', description: 'Intro text.' },
    { name: 'products', type: 'Array<{title, motivation, image?, price?, tags?}>', required: true, description: 'Product entries.' },
  ],
  example: productRecommendationsExample,
  hyperlinkFields: ['title', 'introduction'],
}
