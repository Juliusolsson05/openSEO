import { registerElement } from '../registry'
import { AffiliateRecommendations } from './AffiliateRecommendations'
import { AffiliateRecommendationsPreview } from './AffiliateRecommendationsPreview'
import { AffiliateRecommendationsLoading } from './AffiliateRecommendationsLoading'
import { affiliateRecommendationsEditSchema } from './edit_schema'
import { affiliateRecommendationsExample } from './example'

registerElement('affiliate_recommendations', {
  component: AffiliateRecommendations,
  preview: AffiliateRecommendationsPreview,
  loading: AffiliateRecommendationsLoading,
  editSchema: affiliateRecommendationsEditSchema,
  example: affiliateRecommendationsExample,
})

export {
  AffiliateRecommendations,
  AffiliateRecommendationsPreview,
  AffiliateRecommendationsLoading,
  affiliateRecommendationsEditSchema,
  affiliateRecommendationsExample,
}
