import { registerElement } from '../registry'
import { Quiz } from './Quiz'
import { QuizPreview } from './QuizPreview'
import { QuizLoading } from './QuizLoading'
import { quizExample } from './example'

export { Quiz } from './Quiz'
export { QuizPreview } from './QuizPreview'
export { QuizLoading } from './QuizLoading'
export { quizExample } from './example'

registerElement('quiz', {
  component: Quiz,
  preview: QuizPreview,
  loading: QuizLoading,
  example: quizExample,
})
