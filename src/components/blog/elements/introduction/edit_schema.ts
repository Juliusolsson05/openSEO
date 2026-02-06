import type { EditSchema } from '../types'
import { TextAreaField } from '../types'

export const introductionEditSchema: EditSchema = {
  title: 'Edit Introduction',
  fields: {
    text: TextAreaField('Introduction Text', {
      required: true,
      description: 'Provides an engaging start to the blog post, outlining what readers can expect.',
      placeholder: 'Write an engaging introduction...',
      validation: [
        { type: 'required', message: 'Introduction text is required' },
        { type: 'minLength', value: 10, message: 'Introduction should be at least 10 characters' },
      ],
    }),
  },
}
