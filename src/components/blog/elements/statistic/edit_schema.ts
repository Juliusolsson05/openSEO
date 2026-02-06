import type { EditSchema } from '../types'
import { PercentageField, TextField } from '../types'

export const statisticEditSchema: EditSchema = {
  title: 'Edit Statistic',
  fields: {
    title: TextField('Title', {
      required: true,
      description: 'The title or context of the statistic',
      validation: [{ type: 'required', message: 'Title is required' }],
    }),
    percentage: PercentageField('Percentage', {
      required: true,
      description: 'The statistical percentage value (0-100)',
      validation: [{ type: 'required', message: 'Percentage is required' }],
    }),
    description: TextField('Description', {
      required: true,
      description: 'Additional details or interpretation of the statistic',
      validation: [{ type: 'required', message: 'Description is required' }],
    }),
  },
}
