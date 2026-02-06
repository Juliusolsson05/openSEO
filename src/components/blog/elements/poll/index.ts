import { registerElement } from '../registry'
import { Poll } from './Poll'
import { PollPreview } from './PollPreview'
import { PollLoading } from './PollLoading'

export { Poll } from './Poll'
export { PollPreview } from './PollPreview'
export { PollLoading } from './PollLoading'

registerElement('poll', {
  component: Poll,
  preview: PollPreview,
  loading: PollLoading,
})
