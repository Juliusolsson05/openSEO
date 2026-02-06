import type { EditSchema } from '../types'
import { FaqEditField } from '../types'

export const faqEditSchema: EditSchema = {
  title: 'Edit FAQ',
  fields: {
    faq: FaqEditField('FAQ Items', {
      passthrough: true,
      description: 'Common questions related to the post and their answers',
    }),
  },
}
