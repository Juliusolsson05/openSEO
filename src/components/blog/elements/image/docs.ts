import type { ElementDocs } from '../docs-types'
import { imageExample } from './example'

export const imageDocs: ElementDocs = {
  label: 'Image',
  description: 'Inline image with caption. URLs may be absolute or relative to the API base URL.',
  fields: [
    { name: 'url', type: 'string', required: true, description: 'Image URL. Prefix relative paths with your API base URL.' },
    { name: 'alt', type: 'string', description: 'Alt text for accessibility.' },
    { name: 'caption', type: 'string', description: 'Caption displayed below the image.' },
    { name: 'description', type: 'string', description: 'Longer description (SEO/tooltips).' },
  ],
  example: imageExample,
}
