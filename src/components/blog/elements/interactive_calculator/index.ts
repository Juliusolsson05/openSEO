import { registerElement } from '../registry'
import { InteractiveCalculator } from './InteractiveCalculator'
import { InteractiveCalculatorPreview } from './InteractiveCalculatorPreview'
import { InteractiveCalculatorLoading } from './InteractiveCalculatorLoading'
import { interactiveCalculatorExample } from './example'

export { InteractiveCalculator } from './InteractiveCalculator'
export { InteractiveCalculatorPreview } from './InteractiveCalculatorPreview'
export { InteractiveCalculatorLoading } from './InteractiveCalculatorLoading'
export { interactiveCalculatorExample } from './example'

registerElement('interactive_calculator', {
  component: InteractiveCalculator,
  preview: InteractiveCalculatorPreview,
  loading: InteractiveCalculatorLoading,
  example: interactiveCalculatorExample,
})
