import { registerElement } from '../registry'
import { Checklist } from './Checklist'
import { ChecklistPreview } from './ChecklistPreview'
import { ChecklistLoading } from './ChecklistLoading'
import Icon from './Icon'
import { checklistExample } from './example'
import { checklistDocs } from './docs'

registerElement('checklist', {
  component: Checklist,
  preview: ChecklistPreview,
  loading: ChecklistLoading,
  icon: Icon,
  example: checklistExample,
  docs: checklistDocs,
})

export { Checklist }
export { ChecklistPreview }
export { ChecklistLoading }
export { checklistExample }
