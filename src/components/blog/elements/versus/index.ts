import { registerElement } from '../registry'
import { Versus } from './Versus'
import { VersusPreview } from './VersusPreview'
import { VersusLoading } from './VersusLoading'
import { versusEditSchema } from './edit_schema'
import { versusExample } from './example'

registerElement('versus', {
  component: Versus,
  preview: VersusPreview,
  loading: VersusLoading,
  editSchema: versusEditSchema,
  example: versusExample,
})

export { Versus, VersusPreview, VersusLoading, versusEditSchema, versusExample }
