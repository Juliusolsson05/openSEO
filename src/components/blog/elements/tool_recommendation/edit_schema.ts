import { type EditSchema, ArrayField, ColorField, RichTextField, TextField, URLField } from '../types'

export const toolRecommendationEditSchema: EditSchema = {
  title: 'Edit Tool Recommendation',
  fields: {
    title: TextField('Tool Name', {
      required: true,
      description: 'The name or title of the recommended tool',
    }),
    companyUrl: URLField('Company URL', {
      required: true,
      description: "The URL of the company's website or the tool's landing page",
    }),
    pricing: TextField('Pricing', {
      required: true,
      description: "Brief description of the pricing model (e.g., 'Free', '$10/month')",
    }),
    productDescription: RichTextField('Product Description', {
      required: true,
      description: 'A detailed description of the tool, including its key features, benefits, and use cases',
    }),
    headerColor: ColorField('Header Color', {
      required: true,
      description: 'Hex color code for the header background',
    }),
    features: ArrayField('Features', TextField('Feature'), {
      required: true,
      minItems: 1,
      description: 'An array of key features or benefits of the tool',
    }),
  },
}
