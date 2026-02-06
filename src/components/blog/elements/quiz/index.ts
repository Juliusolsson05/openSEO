import { registerElement } from '../registry'
import { Quiz } from './Quiz'
import { QuizPreview } from './QuizPreview'
import { QuizLoading } from './QuizLoading'

export { Quiz } from './Quiz'
export { QuizPreview } from './QuizPreview'
export { QuizLoading } from './QuizLoading'

registerElement('quiz', {
  component: Quiz,
  preview: QuizPreview,
  loading: QuizLoading,
})
