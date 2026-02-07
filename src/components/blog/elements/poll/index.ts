import { registerElement } from '../registry'
import { Poll } from './Poll'
import { PollPreview } from './PollPreview'
import { PollLoading } from './PollLoading'
import { pollExample } from './example'

export { Poll } from './Poll'
export { PollPreview } from './PollPreview'
export { PollLoading } from './PollLoading'
export { pollExample } from './example'

registerElement('poll', {
  component: Poll,
  preview: PollPreview,
  loading: PollLoading,
  example: pollExample,
})
