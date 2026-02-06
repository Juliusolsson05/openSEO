import { type EditSchema, TextField, RichTextField, ArrayObjectField, URLField } from '../types'

export const productRecommendationsEditSchema: EditSchema = {
  title: 'Edit Product Recommendations',
  fields: {
    title: TextField('Title', { required: true }),
    introduction: RichTextField('Introduction', { required: true }),
    products: ArrayObjectField(
      'Products',
      {
        title: TextField('Product title', { required: true }),
        motivation: RichTextField('Motivation', { required: true }),
        image: URLField('Image URL'),
        price: TextField('Price'),
      },
      {
        minItems: 0,
        maxItems: 20,
      }
    ),
  },
}
