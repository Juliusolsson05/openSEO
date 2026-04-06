import { registerElement } from '../registry'
import { ListParagraph } from './ListParagraph'
import { ListParagraphPreview } from './ListParagraphPreview'
import { ListParagraphLoading } from './ListParagraphLoading'
import Icon from './Icon'
import { listParagraphEditSchema } from './edit_schema'
import { listParagraphExample } from './example'
import { listParagraphDocs } from './docs'

registerElement('list_paragraph', {
  component: ListParagraph,
  preview: ListParagraphPreview,
  loading: ListParagraphLoading,
  icon: Icon,
  editSchema: listParagraphEditSchema,
  example: listParagraphExample,
  docs: listParagraphDocs,
})

export { ListParagraph }
export { ListParagraphPreview }
export { ListParagraphLoading }
export { listParagraphEditSchema }
export { listParagraphExample }
