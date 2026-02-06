import { registerElement } from '../registry'
import { FAQ } from './FAQ'
import { FAQPreview } from './FAQPreview'
import { FAQLoading } from './FAQLoading'
import { faqEditSchema } from './edit_schema'
import { faqExample } from './example'

registerElement('faq', {
  component: FAQ,
  preview: FAQPreview,
  loading: FAQLoading,
  editSchema: faqEditSchema,
  example: faqExample,
})

export { FAQ, FAQPreview, FAQLoading, faqEditSchema, faqExample }
