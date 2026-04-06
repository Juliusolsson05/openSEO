import { registerElement } from '../registry'
import { SnippetBlock } from './SnippetBlock'
import { SnippetBlockPreview } from './SnippetBlockPreview'
import { SnippetBlockLoading } from './SnippetBlockLoading'
import Icon from './Icon'
import { snippetBlockEditSchema } from './edit_schema'
import { snippetBlockExample } from './example'
import { snippetBlockDocs } from './docs'

export { SnippetBlock } from './SnippetBlock'
export { SnippetBlockPreview } from './SnippetBlockPreview'
export { SnippetBlockLoading } from './SnippetBlockLoading'
export { snippetBlockEditSchema } from './edit_schema'
export { snippetBlockExample } from './example'

registerElement('featured_snippet_block', {
  component: SnippetBlock,
  preview: SnippetBlockPreview,
  loading: SnippetBlockLoading,
  icon: Icon,
  editSchema: snippetBlockEditSchema,
  example: snippetBlockExample,
  docs: snippetBlockDocs,
})
