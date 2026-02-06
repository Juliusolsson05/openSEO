import { registerElement } from '../registry'
import { CallToAction } from './CallToAction'
import { CallToActionPreview } from './CallToActionPreview'
import { CallToActionLoading } from './CallToActionLoading'

export { CallToAction } from './CallToAction'
export { CallToActionPreview } from './CallToActionPreview'
export { CallToActionLoading } from './CallToActionLoading'

const config = {
  component: CallToAction,
  preview: CallToActionPreview,
  loading: CallToActionLoading,
}

registerElement('call_to_action', config)
registerElement('cta', config)
