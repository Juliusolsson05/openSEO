import { registerElement } from '../registry'
import { ImageElement } from './ImageElement'
import { ImagePreview } from './ImagePreview'
import { ImageLoading } from './ImageLoading'
import Icon from './Icon'
import { imageEditSchema } from './edit_schema'
import { imageExample } from './example'
import { imageDocs } from './docs'

export { ImageElement } from './ImageElement'
export { ImagePreview } from './ImagePreview'
export { ImageLoading } from './ImageLoading'
export { imageEditSchema } from './edit_schema'
export { imageExample } from './example'

registerElement('image', {
  component: ImageElement,
  preview: ImagePreview,
  loading: ImageLoading,
  icon: Icon,
  editSchema: imageEditSchema,
  example: imageExample,
  docs: imageDocs,
})
