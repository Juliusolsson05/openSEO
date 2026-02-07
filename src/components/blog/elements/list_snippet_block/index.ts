import { registerElement } from '../registry'
import { ListSnippetBlock } from './ListSnippetBlock'
import { ListSnippetBlockPreview } from './ListSnippetBlockPreview'
import { ListSnippetBlockLoading } from './ListSnippetBlockLoading'
import Icon from './Icon'
import { listSnippetBlockEditSchema } from './edit_schema'
import { listSnippetBlockExample } from './example'

export { ListSnippetBlock } from './ListSnippetBlock'
export { ListSnippetBlockPreview } from './ListSnippetBlockPreview'
export { ListSnippetBlockLoading } from './ListSnippetBlockLoading'
export { listSnippetBlockEditSchema } from './edit_schema'
export { listSnippetBlockExample } from './example'

registerElement('list_featured_snippet_block', {
  component: ListSnippetBlock,
  preview: ListSnippetBlockPreview,
  loading: ListSnippetBlockLoading,
  icon: Icon,
  editSchema: listSnippetBlockEditSchema,
  example: listSnippetBlockExample,
})
