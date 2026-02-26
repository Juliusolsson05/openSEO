export { BaseElement } from './BaseElement'
export { BasePreview } from './BasePreview'
export { BaseEdit } from './BaseEdit'
export { DefaultComponent, DefaultLoading, DefaultPreview } from './DefaultComponent'
export { ElementRenderer } from './ElementRenderer'
export {
  registerElement,
  getComponent,
  getPreviewComponent,
  getLoadingComponent,
  getEditSchema,
  getExample,
  getIcon,
  getElementInfo,
} from './registry'
export type {
  ElementComponentProps,
  PreviewComponentProps,
} from './registry'
export type { ElementType, EditSchema, EditField } from './types'
export * from './types'

// ─── Element registrations (side-effect imports) ─────────────────────
// Each index.ts calls registerElement() at module scope.
import './paragraph'
import './introduction'
import './conclusion'
import './list_paragraph'
import './numbered_list_paragraph'
import './table'
import './faq'
import './quote'
import './checklist'
import './statistic'
import './pros_and_cons'
import './versus'
import './timeline'
import './bar_chart'
import './snippet_block'
import './list_snippet_block'
import './case_study'
import './tool_recommendation'
import './call_to_action'
import './product_recommendations'
import './image'
import './glossary'
import './context'
import './code_cluster'
import './poll'
import './quiz'
import './interactive_calculator'
import './affiliate_recommendations'
