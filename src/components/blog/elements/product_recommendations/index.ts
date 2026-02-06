import { registerElement } from '../registry'
import { ProductRecommendations } from './ProductRecommendations'
import { ProductRecommendationsPreview } from './ProductRecommendationsPreview'
import { ProductRecommendationsLoading } from './ProductRecommendationsLoading'
import { productRecommendationsEditSchema } from './edit_schema'
import { productRecommendationsExample } from './example'

export { ProductRecommendations } from './ProductRecommendations'
export { ProductRecommendationsPreview } from './ProductRecommendationsPreview'
export { ProductRecommendationsLoading } from './ProductRecommendationsLoading'
export { productRecommendationsEditSchema } from './edit_schema'
export { productRecommendationsExample } from './example'

registerElement('product_recommendations', {
  component: ProductRecommendations,
  preview: ProductRecommendationsPreview,
  loading: ProductRecommendationsLoading,
  editSchema: productRecommendationsEditSchema,
  example: productRecommendationsExample,
})
