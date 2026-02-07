import { registerElement } from '../registry'
import { Context } from './Context'
import { ContextPreview } from './ContextPreview'
import { ContextLoading } from './ContextLoading'
import Icon from './Icon'
import { contextExample } from './example'

export { Context } from './Context'
export { ContextPreview } from './ContextPreview'
export { ContextLoading } from './ContextLoading'
export { contextExample } from './example'

registerElement('context', {
  component: Context,
  preview: ContextPreview,
  loading: ContextLoading,
  icon: Icon,
  example: contextExample,
})
