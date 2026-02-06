import type { EditSchema } from '../types'
import { ArrayField, ArrayObjectField, NumberField, RichTextField, TextField } from '../types'

export const versusEditSchema: EditSchema = {
  title: 'Edit Versus Comparison',
  fields: {
    title: TextField('Title', {
      required: true,
      description: 'The main title for the versus comparison',
    }),
    text_before: RichTextField('Text Before'),
    competitors: ArrayField('Competitors', TextField('Competitor'), {
      required: true,
      minItems: 2,
      maxItems: 2,
      description: 'Names of the two items being compared',
    }),
    criteria: ArrayObjectField(
      'Comparison Criteria',
      {
        name: TextField('Criterion Name', {
          required: true,
          description: 'Name of the comparison criterion',
        }),
        winner: NumberField('Winner', {
          required: true,
          validation: [
            { type: 'min', value: 0, message: 'Winner must be 0 or 1' },
            { type: 'max', value: 1, message: 'Winner must be 0 or 1' },
          ],
        }),
        details: ArrayField('Details', TextField('Detail'), {
          required: true,
          minItems: 2,
          maxItems: 2,
          description: 'Details for each competitor for this criterion',
        }),
      },
      {
        minItems: 2,
        description: 'List of criteria for comparison',
      }
    ),
    text_after: RichTextField('Text After'),
  },
}
