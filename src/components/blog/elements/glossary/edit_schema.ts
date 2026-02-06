import { type EditSchema, TextField, ObjectField } from '../types'

export const glossaryEditSchema: EditSchema = {
  title: 'Edit Glossary',
  fields: {
    title: TextField('Title', {
      required: true,
      validation: [{ type: 'required', message: 'Title is required' }],
    }),
    terms: ObjectField(
      'Terms',
      {
        key: TextField('Term'),
        value: TextField('Definition'),
      },
      {
        passthrough: true,
        description: 'Glossary terms and their definitions',
      }
    ),
  },
}
