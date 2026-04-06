/**
 * Autopilot domain types — single source of truth.
 */

export type AutopilotStage =
  | 'element_suggestions'
  | 'element_creation'
  | 'paragraph_suggestions'
  | 'paragraph_creation'
  | 'content_improvement_analysis'
  | 'content_improvement'
  | 'image_analysis'
  | 'image_generation'

export type AutopilotLogType =
  | 'status'
  | 'stage_started'
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'finished'
  | 'launched'

export interface AutopilotLogData {
  status?: 'started' | 'completed'
  stage?: string
  chain_id?: string
  stages?: string[]
  num_recommendations?: number
  recommendations_summary?: RecommendationSummary[]
  element_id?: number
  element_type?: string
  after_element_id?: number
  index?: number
  num_improvements?: number
  improvements_summary?: ImprovementSummary[]
  applied_tools?: string[]
  url?: string
  error?: string
  style_guide_brief?: string
  num_images?: number
  images_summary?: ImageSummary[]
}

export interface AutopilotLog {
  timestamp: string
  stage: AutopilotStage
  type: AutopilotLogType
  data: AutopilotLogData
}

export interface RecommendationSummary {
  element_type: string
  after_element_id: number
}

export interface ImprovementSummary {
  element_id: number
  element_type: string
  tools: string[]
}

export interface ImageSummary {
  element_id: number
}

export interface AutopilotOperation {
  elementId?: number
  type: 'new' | 'enhancement' | 'regeneration'
  status: 'planned' | 'in_progress' | 'completed' | 'error'
  position?: {
    afterElementId: number
  }
  elementType?: string
  tools?: string[]
}
