import { type EditSchema, ArrayField, ColorField, ObjectField, RichTextField, TextField, URLField } from '../types'

export const caseStudyEditSchema: EditSchema = {
  title: 'Edit Case Study',
  fields: {
    title: TextField('Title', {
      required: true,
      description: 'The main title of the case study, highlighting the key achievement',
    }),
    clientName: TextField('Client Name', {
      required: true,
      description: 'Name of the company or client featured in the case study',
    }),
    industry: TextField('Industry', {
      required: true,
      description: 'The industry or sector the client operates in',
    }),
    companyWebsite: URLField('Company Website', {
      required: true,
      description: 'The official website URL of the featured company',
    }),
    headerColor: ColorField('Header Color', {
      required: true,
      description: 'Hex color code for the header background',
    }),
    challenge: RichTextField('Challenge', {
      required: true,
      description: 'A brief description of the problem or challenge the client faced',
    }),
    solution: RichTextField('Solution', {
      required: true,
      description: 'A concise explanation of the solution implemented to address the challenge',
    }),
    results: ArrayField('Results', TextField('Result'), {
      required: true,
      description: 'List of key results or achievements',
    }),
    testimonial: ObjectField(
      'Testimonial',
      {
        quote: TextField('Quote', {
          required: true,
          description: 'A direct quote from the client about the impact of the solution',
        }),
        author: TextField('Author', {
          required: true,
          description: 'Name and title of the person providing the testimonial',
        }),
      },
      {
        required: true,
      }
    ),
  },
}
