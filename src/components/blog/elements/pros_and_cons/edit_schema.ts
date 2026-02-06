import { type EditSchema, ProsConsField, RichTextField, TextField } from '../types'

export const prosAndConsEditSchema: EditSchema = {
  title: 'Edit Pros & Cons',
  fields: {
    title: TextField('Title', {
      required: true,
      description: 'The main title for the pros and cons section',
    }),
    text_before: RichTextField('Text Before', {
      description: 'Optional text to display before the pros and cons lists',
    }),
    comparison: {
      poolField: {
        keys: ['pros', 'cons'],
        field: ProsConsField('Pros & Cons', {
          required: true,
        }),
      },
    },
    text_after: RichTextField('Text After', {
      description: 'Optional text to display after the pros and cons lists',
    }),
  },
}
