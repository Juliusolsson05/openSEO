import { registerElement } from '../registry'
import { Checklist } from './Checklist'
import { ChecklistPreview } from './ChecklistPreview'
import { ChecklistLoading } from './ChecklistLoading'

registerElement('checklist', {
  component: Checklist,
  preview: ChecklistPreview,
  loading: ChecklistLoading,
})

export { Checklist }
export { ChecklistPreview }
export { ChecklistLoading }
