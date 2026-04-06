import { registerElement } from '../registry'
import { Conclusion } from './Conclusion'
import { ConclusionPreview } from './ConclusionPreview'
import { ConclusionLoading } from './ConclusionLoading'
import Icon from './Icon'
import { conclusionEditSchema } from './edit_schema'
import { conclusionExample } from './example'
import { conclusionDocs } from './docs'

export { Conclusion } from './Conclusion'
export { ConclusionPreview } from './ConclusionPreview'
export { ConclusionLoading } from './ConclusionLoading'
export { conclusionEditSchema } from './edit_schema'
export { conclusionExample } from './example'

registerElement('conclusion', {
  component: Conclusion,
  preview: ConclusionPreview,
  loading: ConclusionLoading,
  icon: Icon,
  editSchema: conclusionEditSchema,
  example: conclusionExample,
  docs: conclusionDocs,
})
