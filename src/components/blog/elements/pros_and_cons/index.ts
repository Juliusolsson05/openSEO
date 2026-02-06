import { registerElement } from '../registry'
import { ProsAndCons } from './ProsAndCons'
import { ProsAndConsPreview } from './ProsAndConsPreview'
import { ProsAndConsLoading } from './ProsAndConsLoading'
import { prosAndConsEditSchema } from './edit_schema'
import { prosAndConsExample } from './example'

registerElement('pros_and_cons', {
  component: ProsAndCons,
  preview: ProsAndConsPreview,
  loading: ProsAndConsLoading,
  editSchema: prosAndConsEditSchema,
  example: prosAndConsExample,
})

export { ProsAndCons }
export { ProsAndConsPreview }
export { ProsAndConsLoading }
export { prosAndConsEditSchema }
export { prosAndConsExample }
