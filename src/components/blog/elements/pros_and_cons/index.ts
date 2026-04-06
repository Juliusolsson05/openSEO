import { registerElement } from '../registry'
import { ProsAndCons } from './ProsAndCons'
import { ProsAndConsPreview } from './ProsAndConsPreview'
import { ProsAndConsLoading } from './ProsAndConsLoading'
import Icon from './Icon'
import { prosAndConsEditSchema } from './edit_schema'
import { prosAndConsExample } from './example'
import { prosAndConsDocs } from './docs'

registerElement('pros_and_cons', {
  component: ProsAndCons,
  preview: ProsAndConsPreview,
  loading: ProsAndConsLoading,
  icon: Icon,
  editSchema: prosAndConsEditSchema,
  example: prosAndConsExample,
  docs: prosAndConsDocs,
})

export { ProsAndCons }
export { ProsAndConsPreview }
export { ProsAndConsLoading }
export { prosAndConsEditSchema }
export { prosAndConsExample }
