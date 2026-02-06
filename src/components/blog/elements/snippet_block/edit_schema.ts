import type { EditSchema } from '../types'
import { RichTextField, TextField } from '../types'

export const snippetBlockEditSchema: EditSchema = {
  title: 'Edit Featured Snippet',
  fields: {
    title: TextField('Title', {
      required: true,
      description: 'Title for the featured snippet block',
      validation: [{ type: 'required', message: 'Title is required' }],
    }),
    text: RichTextField('Content', {
      required: true,
      description: 'Text providing key insights or tips within the featured snippet block',
      validation: [{ type: 'required', message: 'Content is required' }],
    }),
  },
}
