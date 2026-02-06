import { registerElement } from '../registry'
import { SnippetBlock } from './SnippetBlock'
import { SnippetBlockPreview } from './SnippetBlockPreview'
import { SnippetBlockLoading } from './SnippetBlockLoading'
import { snippetBlockEditSchema } from './edit_schema'
import { snippetBlockExample } from './example'

export { SnippetBlock } from './SnippetBlock'
export { SnippetBlockPreview } from './SnippetBlockPreview'
export { SnippetBlockLoading } from './SnippetBlockLoading'
export { snippetBlockEditSchema } from './edit_schema'
export { snippetBlockExample } from './example'

registerElement('featured_snippet_block', {
  component: SnippetBlock,
  preview: SnippetBlockPreview,
  loading: SnippetBlockLoading,
  editSchema: snippetBlockEditSchema,
  example: snippetBlockExample,
})
