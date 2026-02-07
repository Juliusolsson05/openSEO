import { registerElement } from '../registry'
import { ToolRecommendation } from './ToolRecommendation'
import { ToolRecommendationPreview } from './ToolRecommendationPreview'
import { ToolRecommendationLoading } from './ToolRecommendationLoading'
import Icon from './Icon'
import { toolRecommendationEditSchema } from './edit_schema'
import { toolRecommendationExample } from './example'

registerElement('tool_recommendation', {
  component: ToolRecommendation,
  preview: ToolRecommendationPreview,
  loading: ToolRecommendationLoading,
  icon: Icon,
  editSchema: toolRecommendationEditSchema,
  example: toolRecommendationExample,
})

export { ToolRecommendation }
export { ToolRecommendationPreview }
export { ToolRecommendationLoading }
export { toolRecommendationEditSchema }
export { toolRecommendationExample }
