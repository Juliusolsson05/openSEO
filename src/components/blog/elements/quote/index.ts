import { registerElement } from '../registry'
import { Quote } from './Quote'
import { QuotePreview } from './QuotePreview'
import { QuoteLoading } from './QuoteLoading'
import { quoteEditSchema } from './edit_schema'
import { quoteExample } from './example'

export { Quote } from './Quote'
export { QuotePreview } from './QuotePreview'
export { QuoteLoading } from './QuoteLoading'
export { quoteEditSchema } from './edit_schema'
export { quoteExample } from './example'

registerElement('quote', {
  component: Quote,
  preview: QuotePreview,
  loading: QuoteLoading,
  editSchema: quoteEditSchema,
  example: quoteExample,
})
