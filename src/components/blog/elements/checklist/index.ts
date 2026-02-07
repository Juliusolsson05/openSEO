import { registerElement } from '../registry'
import { Checklist } from './Checklist'
import { ChecklistPreview } from './ChecklistPreview'
import { ChecklistLoading } from './ChecklistLoading'
import Icon from './Icon'
import { checklistExample } from './example'

registerElement('checklist', {
  component: Checklist,
  preview: ChecklistPreview,
  loading: ChecklistLoading,
  icon: Icon,
  example: checklistExample,
})

export { Checklist }
export { ChecklistPreview }
export { ChecklistLoading }
export { checklistExample }
