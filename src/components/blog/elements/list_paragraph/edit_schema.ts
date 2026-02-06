import { ArrayField, type EditSchema, RichTextField, TextField } from '../types'

export const listParagraphEditSchema: EditSchema = {
  title: 'Edit List Paragraph',
  fields: {
    title: TextField('Title', {
      required: false,
      description: 'Title for the list',
    }),
    text_before_list: RichTextField('Text Before List', {
      required: true,
      description: 'Introductory text before the list',
    }),
    list_items: ArrayField('List Items', TextField('Item'), {
      required: true,
      minItems: 4,
      description: 'List items',
    }),
    text_after_list: RichTextField('Text After List', {
      required: true,
      description: 'Concluding text after the list',
    }),
  },
}
