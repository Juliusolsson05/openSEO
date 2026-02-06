import { registerElement } from '../registry'
import { Table } from './Table'
import { TablePreview } from './TablePreview'
import { TableLoading } from './TableLoading'
import { tableEditSchema } from './edit_schema'
import { tableExample } from './example'

export { Table } from './Table'
export { TablePreview } from './TablePreview'
export { TableLoading } from './TableLoading'
export { tableEditSchema } from './edit_schema'
export { tableExample } from './example'

registerElement('table', {
  component: Table,
  preview: TablePreview,
  loading: TableLoading,
  editSchema: tableEditSchema,
  example: tableExample,
})
