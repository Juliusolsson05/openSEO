import { ArrayField, type EditSchema, TextField } from '../types'

export const listSnippetBlockEditSchema: EditSchema = {
  title: 'Edit List Snippet',
  fields: {
    title: TextField('Title', {
      required: true,
      description: 'Title for the list featured snippet block',
    }),
    list: ArrayField('List Items', TextField('Item'), {
      required: true,
      minItems: 4,
      description: 'List of highlighted items in the featured snippet block',
    }),
  },
}
