import { registerElement } from '../registry'
import { Context } from './Context'
import { ContextPreview } from './ContextPreview'
import { ContextLoading } from './ContextLoading'

export { Context } from './Context'
export { ContextPreview } from './ContextPreview'
export { ContextLoading } from './ContextLoading'

registerElement('context', {
  component: Context,
  preview: ContextPreview,
  loading: ContextLoading,
})
