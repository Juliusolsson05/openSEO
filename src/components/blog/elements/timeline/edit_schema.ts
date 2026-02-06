import type { EditSchema } from '../types'
import { ArrayObjectField, RichTextField, TextField } from '../types'

export const timelineEditSchema: EditSchema = {
  title: 'Edit Timeline',
  fields: {
    title: TextField('Title', {
      required: false,
      description: 'The title of the timeline section',
    }),
    text_before: RichTextField('Text Before', {
      description: 'Optional introductory text before the timeline',
    }),
    events: ArrayObjectField(
      'Timeline Events',
      {
        date: TextField('Date', {
          required: true,
          description: 'The date or time period of the event',
        }),
        title: TextField('Event Title', {
          required: true,
          description: 'Title of the event',
        }),
        description: RichTextField('Event Description', {
          required: true,
          description: 'Detailed description of what happened during this event',
        }),
      },
      {
        required: true,
        minItems: 3,
        maxItems: 10,
        description: 'Array of chronological events to display',
      }
    ),
    text_after: RichTextField('Text After', {
      description: 'Optional concluding text after the timeline',
    }),
  },
}
