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
export type {
  BlogPost,
  BlogPostElement,
  BlogPostSummary,
  BlogTitle,
  LinkedPost,
  Category,
  CoverImage,
  HyperlinkData,
} from './blog'

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

// Dictionary
export type {
  DashboardFAQ,
  DashboardDefinition,
  DashboardWord,
  DashboardDictionary,
  ContentElement,
  ContentPost,
  ContentFaq,
  WordDefinition,
  ContentWord,
  ContentDictionary,
} from './dictionary'

// CTA
export type { CTA } from './cta'

// Analytics
export type {
  AnalyticsMetric,
  ScoreBreakdownItem,
  BlogGeneralData,
  BlogGeneralResponse,
  BlogMetaData,
  BlogMetaResponse,
  OversizedSeoTitle,
  OversizedMetaDescription,
  DictionaryWordCount,
  DictionaryGeneralResponse,
  AnalyticsBlogTitle,
  ElementBreakdownResponse,
  AnalyticsData,
} from './analytics'

// Autopilot
export type {
  AutopilotStage,
  AutopilotLogType,
  AutopilotLog,
  AutopilotLogData,
  AutopilotOperation,
  RecommendationSummary,
  ImprovementSummary,
  ImageSummary,
} from './autopilot'

// Publishing
export type { InboundEnvelope, RawElement } from './publishing'
export { readInboundKey } from './publishing'

// Settings
export type { GenerationSettings, PublishingSettings, ApiKey } from './settings'

// Company
export type { CompanyProfile, CompanyProfileResponse, AnalyzeResponse } from './company'

// Quillo / AI Chat
export type { ChatMessage, StructuredMessage } from './quillo'
