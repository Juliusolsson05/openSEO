import { registerElement } from '../registry'
import { Versus } from './Versus'
import { VersusPreview } from './VersusPreview'
import { VersusLoading } from './VersusLoading'
import Icon from './Icon'
import { versusEditSchema } from './edit_schema'
import { versusExample } from './example'
import { versusDocs } from './docs'

registerElement('versus', {
  component: Versus,
  preview: VersusPreview,
  loading: VersusLoading,
  icon: Icon,
  editSchema: versusEditSchema,
  example: versusExample,
  docs: versusDocs,
})

export { Versus, VersusPreview, VersusLoading, versusEditSchema, versusExample }
