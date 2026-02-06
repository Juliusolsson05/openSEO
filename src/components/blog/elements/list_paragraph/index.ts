import { registerElement } from '../registry'
import { ListParagraph } from './ListParagraph'
import { ListParagraphPreview } from './ListParagraphPreview'
import { ListParagraphLoading } from './ListParagraphLoading'
import { listParagraphEditSchema } from './edit_schema'
import { listParagraphExample } from './example'

registerElement('list_paragraph', {
  component: ListParagraph,
  preview: ListParagraphPreview,
  loading: ListParagraphLoading,
  editSchema: listParagraphEditSchema,
  example: listParagraphExample,
})

export { ListParagraph }
export { ListParagraphPreview }
export { ListParagraphLoading }
export { listParagraphEditSchema }
export { listParagraphExample }
