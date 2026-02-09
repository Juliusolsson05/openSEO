/**
 * Central type barrel — import from '@/types' for convenience.
 */

// Common
export type { SaveStatus, SortDir, IconProps } from './common'

// Auth
export { USER_TYPES } from './auth'
export type { UserType, AuthUser } from './auth'

// API
export type { ApiOptions, ApiResponse, ApiMeta, ApiProblem, ApiSuccessResponse, ApiErrorResponse } from './api'

// Blog
export type { BlogPost, BlogPostElement, BlogTitle, LinkedPost, Category, CoverImage, HyperlinkData } from './blog'

// Content Elements
export type {
  FAQItem, FAQContent,
  ChecklistItem, ChecklistContent,
  TimelineEvent, TimelineContent,
  GlossaryTerm, GlossaryContent,
  VersusCriterion, VersusContent,
  BarItem, BarChartContent,
  TableContent,
  ProsAndConsContent,
  QuizQuestion, QuizContent,
  PollContent,
  InteractiveCalculatorContent,
  ToolRecommendationContent,
  ProductRecommendation, ProductRecommendationsContent,
  CaseStudyContent,
} from './content-elements'

// Dictionary / Public Content
export type { ContentElement, ContentPost, ContentFaq, WordDefinition, ContentWord, ContentDictionary } from './dictionary'

// Publishing
export type { InboundEnvelope, RawElement } from './publishing'
export { readInboundKey } from './publishing'

// Quillo / AI Chat
export type { ChatMessage, StructuredMessage } from './quillo'
