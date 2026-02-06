import { ArrayObjectField, EditSchema, NumberField, RichTextField, TextField } from '../types'

export const barChartEditSchema: EditSchema = {
  title: 'Edit Bar Chart',
  fields: {
    title: TextField('Title', {
      required: true,
      description: 'The title of the chart',
    }),
    text_before: RichTextField('Text Before', {
      description: 'Optional text to display before the chart',
    }),
    bars: ArrayObjectField(
      'Chart Bars',
      {
        label: TextField('Label', {
          required: true,
          description: 'Label for the bar',
        }),
        value: NumberField('Value', {
          required: true,
          validation: [
            { type: 'min', value: 0, message: 'Value must be between 0 and 100' },
            { type: 'max', value: 100, message: 'Value must be between 0 and 100' },
          ],
        }),
      },
      {
        required: true,
        minItems: 2,
        maxItems: 8,
        description: 'The bars to display in the chart',
      }
    ),
    text_after: RichTextField('Text After', {
      description: 'Optional text to display after the chart',
    }),
  },
}
