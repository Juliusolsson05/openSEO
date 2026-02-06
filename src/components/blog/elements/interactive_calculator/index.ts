import { registerElement } from '../registry'
import { InteractiveCalculator } from './InteractiveCalculator'
import { InteractiveCalculatorPreview } from './InteractiveCalculatorPreview'
import { InteractiveCalculatorLoading } from './InteractiveCalculatorLoading'

export { InteractiveCalculator } from './InteractiveCalculator'
export { InteractiveCalculatorPreview } from './InteractiveCalculatorPreview'
export { InteractiveCalculatorLoading } from './InteractiveCalculatorLoading'

registerElement('interactive_calculator', {
  component: InteractiveCalculator,
  preview: InteractiveCalculatorPreview,
  loading: InteractiveCalculatorLoading,
})
