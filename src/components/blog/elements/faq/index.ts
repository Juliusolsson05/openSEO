import { registerElement } from '../registry'
import { FAQ } from './FAQ'
import { FAQPreview } from './FAQPreview'
import { FAQLoading } from './FAQLoading'
import Icon from './Icon'
import { faqEditSchema } from './edit_schema'
import { faqExample } from './example'
import { faqDocs } from './docs'

registerElement('faq', {
  component: FAQ,
  preview: FAQPreview,
  loading: FAQLoading,
  icon: Icon,
  editSchema: faqEditSchema,
  example: faqExample,
  docs: faqDocs,
})

export { FAQ, FAQPreview, FAQLoading, faqEditSchema, faqExample }
