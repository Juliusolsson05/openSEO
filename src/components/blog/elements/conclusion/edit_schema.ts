import type { EditSchema } from '../types'
import { RichTextField } from '../types'

export const conclusionEditSchema: EditSchema = {
  title: 'Edit Conclusion',
  fields: {
    text: RichTextField('Conclusion Text', {
      required: true,
      description: 'Summarizes the key points and wraps up the blog post effectively.',
    }),
  },
}
