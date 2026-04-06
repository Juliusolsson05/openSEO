import { registerElement } from '../registry'
import { Paragraph } from './Paragraph'
import { ParagraphPreview } from './ParagraphPreview'
import { ParagraphLoading } from './ParagraphLoading'
import Icon from './Icon'
import { paragraphEditSchema } from './edit_schema'
import { paragraphExample } from './example'
import { paragraphDocs } from './docs'

registerElement('paragraph', {
  component: Paragraph,
  preview: ParagraphPreview,
  loading: ParagraphLoading,
  icon: Icon,
  editSchema: paragraphEditSchema,
  example: paragraphExample,
  docs: paragraphDocs,
})

export { Paragraph, ParagraphPreview, ParagraphLoading, paragraphEditSchema, paragraphExample }
