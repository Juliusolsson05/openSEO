import type { EditSchema } from '../types'
import { TextField } from '../types'

export const quoteEditSchema: EditSchema = {
  title: 'Edit Quote',
  fields: {
    quote: TextField('Quote', {
      required: true,
      description: 'The quote text. Must be a real quote.',
      validation: [{ type: 'required', message: 'Quote is required' }],
    }),
    person: TextField('Person', {
      required: true,
      description: 'Person who said the quote',
      validation: [{ type: 'required', message: 'Person is required' }],
    }),
    description: TextField('Description', {
      required: true,
      description: 'Short description of the person',
      validation: [{ type: 'required', message: 'Description is required' }],
    }),
  },
}
