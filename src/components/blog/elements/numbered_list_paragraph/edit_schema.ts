import type { EditSchema } from '../types'
import { TextField, RichTextField, ArrayField } from '../types'

export const numberedListParagraphEditSchema: EditSchema = {
  title: 'Edit Numbered List',
  fields: {
    title: TextField('Title', {
      required: false,
      description: 'Title for the list',
    }),
    text_before_list: RichTextField('Text Before List', {
      required: true,
      description: 'Introductory text before the numbered list',
    }),
    list_items: ArrayField('List Items', TextField('Item'), {
      required: true,
      minItems: 4,
      description: 'Numbered list items',
    }),
    text_after_list: RichTextField('Text After List', {
      required: true,
      description: 'Concluding text after the numbered list',
    }),
  },
}
