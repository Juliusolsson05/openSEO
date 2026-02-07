import type { EditSchema } from '../types'

export const affiliateRecommendationsEditSchema: EditSchema = {
  title: 'Affiliate Recommendations',
  fields: {
    title: { type: 'text', label: 'Title' },
    items: {
      type: 'array-object',
      label: 'Recommendations',
      fields: {
        name: { type: 'text', label: 'Product Name' },
        description: { type: 'textarea', label: 'Description' },
        link: { type: 'url', label: 'Link' },
        price: { type: 'text', label: 'Price' },
        rating: { type: 'number', label: 'Rating' },
        image_url: { type: 'url', label: 'Image URL' },
      },
    },
  },
}
