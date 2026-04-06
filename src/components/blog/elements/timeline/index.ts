import { registerElement } from '../registry'
import { Timeline } from './Timeline'
import { TimelinePreview } from './TimelinePreview'
import { TimelineLoading } from './TimelineLoading'
import Icon from './Icon'
import { timelineEditSchema } from './edit_schema'
import { timelineExample } from './example'
import { timelineDocs } from './docs'

export { Timeline } from './Timeline'
export { TimelinePreview } from './TimelinePreview'
export { TimelineLoading } from './TimelineLoading'
export { timelineEditSchema } from './edit_schema'
export { timelineExample } from './example'

registerElement('timeline', {
  component: Timeline,
  preview: TimelinePreview,
  loading: TimelineLoading,
  icon: Icon,
  editSchema: timelineEditSchema,
  example: timelineExample,
  docs: timelineDocs,
})
