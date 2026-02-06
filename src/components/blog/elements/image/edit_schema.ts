import type { EditSchema } from '../types'
import { URLField, TextField } from '../types'

export const imageEditSchema: EditSchema = {
  title: 'Edit Image',
  fields: {
    url: URLField('Image URL', {
      required: true,
      description: 'URL of the image',
    }),
    description: TextField('Image Description', {
      required: true,
      description: 'Description of the image',
    }),
  },
}
