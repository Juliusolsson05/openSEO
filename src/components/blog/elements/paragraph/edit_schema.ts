import { type EditSchema, TextField, RichTextField } from '../types'

export const paragraphEditSchema: EditSchema = {
  title: 'Edit Paragraph',
  fields: {
    title: TextField('Title', {
      required: true,
      validation: [
        {
          type: 'required',
          message: 'Title is required',
        },
      ],
    }),
    text: RichTextField('Content', {
      required: true,
      validation: [
        {
          type: 'required',
          message: 'Content is required',
        },
        {
          type: 'minLength',
          value: 165,
          message: 'Content must be at least 165 characters',
        },
      ],
    }),
  },
}
