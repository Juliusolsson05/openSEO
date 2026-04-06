import { registerElement } from '../registry'
import { Introduction } from './Introduction'
import { IntroductionPreview } from './IntroductionPreview'
import { IntroductionLoading } from './IntroductionLoading'
import Icon from './Icon'
import { introductionEditSchema } from './edit_schema'
import { introductionExample } from './example'
import { introductionDocs } from './docs'

export { Introduction } from './Introduction'
export { IntroductionPreview } from './IntroductionPreview'
export { IntroductionLoading } from './IntroductionLoading'
export { introductionEditSchema } from './edit_schema'
export { introductionExample } from './example'

registerElement('introduction', {
  component: Introduction,
  preview: IntroductionPreview,
  loading: IntroductionLoading,
  icon: Icon,
  editSchema: introductionEditSchema,
  example: introductionExample,
  docs: introductionDocs,
})
