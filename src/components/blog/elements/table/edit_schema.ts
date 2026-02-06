import { EditSchema, RichTextField, TableEditField, TextField } from '../types'

export const tableEditSchema: EditSchema = {
  title: 'Edit Table',
  fields: {
    title: TextField('Title', {
      required: true,
      description: 'The title of the table',
    }),
    text_before: RichTextField('Text Before'),
    tableContent: {
      poolField: {
        keys: ['headers', 'rows'],
        field: TableEditField('Table', {
          required: true,
          minItems: 2,
          maxItems: 5,
        }),
      },
    },
    text_after: RichTextField('Text After'),
  },
}
