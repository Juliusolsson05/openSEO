import { registerElement } from '../registry'
import { Statistic } from './Statistic'
import { StatisticPreview } from './StatisticPreview'
import { StatisticLoading } from './StatisticLoading'
import { statisticEditSchema } from './edit_schema'
import { statisticExample } from './example'

export { Statistic } from './Statistic'
export { StatisticPreview } from './StatisticPreview'
export { StatisticLoading } from './StatisticLoading'
export { statisticEditSchema } from './edit_schema'
export { statisticExample } from './example'

registerElement('statistic', {
  component: Statistic,
  preview: StatisticPreview,
  loading: StatisticLoading,
  editSchema: statisticEditSchema,
  example: statisticExample,
})
