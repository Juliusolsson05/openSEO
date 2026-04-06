import { registerElement } from '../registry'
import { CallToAction } from './CallToAction'
import { CallToActionPreview } from './CallToActionPreview'
import { CallToActionLoading } from './CallToActionLoading'
import Icon from './Icon'
import { callToActionExample } from './example'
import { callToActionDocs } from './docs'

export { CallToAction } from './CallToAction'
export { CallToActionPreview } from './CallToActionPreview'
export { CallToActionLoading } from './CallToActionLoading'
export { callToActionExample } from './example'

const config = {
  component: CallToAction,
  preview: CallToActionPreview,
  loading: CallToActionLoading,
  icon: Icon,
  example: callToActionExample,
  docs: callToActionDocs,
}

registerElement('call_to_action', config)
registerElement('cta', config)
