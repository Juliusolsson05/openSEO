import { registerElement } from '../registry'
import { Paragraph } from './Paragraph'
import { ParagraphPreview } from './ParagraphPreview'
import { ParagraphLoading } from './ParagraphLoading'
import { paragraphEditSchema } from './edit_schema'
import { paragraphExample } from './example'

registerElement('paragraph', {
  component: Paragraph,
  preview: ParagraphPreview,
  loading: ParagraphLoading,
  editSchema: paragraphEditSchema,
  example: paragraphExample,
})

export { Paragraph, ParagraphPreview, ParagraphLoading, paragraphEditSchema, paragraphExample }
