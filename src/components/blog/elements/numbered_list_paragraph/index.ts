import { registerElement } from '../registry'
import { NumberedListParagraph } from './NumberedListParagraph'
import { NumberedListParagraphPreview } from './NumberedListParagraphPreview'
import { NumberedListParagraphLoading } from './NumberedListParagraphLoading'
import Icon from './Icon'
import { numberedListParagraphEditSchema } from './edit_schema'
import { numberedListParagraphExample } from './example'
import { numberedListParagraphDocs } from './docs'

export { NumberedListParagraph } from './NumberedListParagraph'
export { NumberedListParagraphPreview } from './NumberedListParagraphPreview'
export { NumberedListParagraphLoading } from './NumberedListParagraphLoading'
export { numberedListParagraphEditSchema } from './edit_schema'
export { numberedListParagraphExample } from './example'

registerElement('numbered_list_paragraph', {
  component: NumberedListParagraph,
  preview: NumberedListParagraphPreview,
  loading: NumberedListParagraphLoading,
  icon: Icon,
  editSchema: numberedListParagraphEditSchema,
  example: numberedListParagraphExample,
  docs: numberedListParagraphDocs,
})
