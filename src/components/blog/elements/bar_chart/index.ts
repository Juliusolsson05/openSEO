import { registerElement } from '../registry'
import { BarChart } from './BarChart'
import { BarChartPreview } from './BarChartPreview'
import { BarChartLoading } from './BarChartLoading'
import Icon from './Icon'
import { barChartEditSchema } from './edit_schema'
import { barChartExample } from './example'
import { barChartDocs } from './docs'

export { BarChart } from './BarChart'
export { BarChartPreview } from './BarChartPreview'
export { BarChartLoading } from './BarChartLoading'
export { barChartEditSchema } from './edit_schema'
export { barChartExample } from './example'

registerElement('bar_chart', {
  component: BarChart,
  preview: BarChartPreview,
  loading: BarChartLoading,
  icon: Icon,
  editSchema: barChartEditSchema,
  example: barChartExample,
  docs: barChartDocs,
})
