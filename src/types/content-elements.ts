/**
 * Element content type definitions — single source of truth.
 *
 * Each blog element type has a content shape defined here.
 * Used by both Edit and Preview components.
 */

// ─── FAQ ─────────────────────────────────────────────────
export interface FAQItem { question: string; answer: string }
export interface FAQContent { title?: string; items: FAQItem[] }

// ─── Checklist ───────────────────────────────────────────
export interface ChecklistItem {
  action: string
  details?: string
  checked?: boolean
}
export interface ChecklistContent {
  title?: string
  introduction?: string
  items: ChecklistItem[]
  conclusion?: string
}

// ─── Timeline ────────────────────────────────────────────
export interface TimelineEvent { date: string; title: string; description: string }
export interface TimelineContent { title?: string; text_before?: string; events?: TimelineEvent[]; text_after?: string }

// ─── Glossary ────────────────────────────────────────────
export interface GlossaryTerm { term: string; definition: string }
export interface GlossaryContent { title?: string; terms: GlossaryTerm[] }

// ─── Versus ──────────────────────────────────────────────
export interface VersusCriterion { name: string; winner: number; details: string[] }
export interface VersusContent { title?: string; text_before?: string; competitors: string[]; criteria: VersusCriterion[]; text_after?: string }

// ─── Bar Chart ───────────────────────────────────────────
export interface BarItem { label: string; value: number }
export interface BarChartContent { title: string; text_before?: string; text_after?: string; bars: BarItem[] }

// ─── Table ───────────────────────────────────────────────
export interface TableContent { title?: string; text_before?: string; headers?: string[]; rows?: string[][]; text_after?: string }

// ─── Pros & Cons ─────────────────────────────────────────
export interface ProsAndConsContent { title?: string; text_before?: string; pros?: string[]; cons?: string[]; text_after?: string }

// ─── Quiz ────────────────────────────────────────────────
export interface QuizQuestion { text?: string; options?: string[] }
export interface QuizContent { title?: string; description?: string; questions?: QuizQuestion[] }

// ─── Poll ────────────────────────────────────────────────
export interface PollContent { question?: string; options?: string[]; description?: string }

// ─── Interactive Calculator ──────────────────────────────
export interface InteractiveCalculatorContent { title?: string; description?: string; result?: string }

// ─── Tool Recommendation ─────────────────────────────────
export interface ToolRecommendationContent {
  title: string
  companyUrl: string
  companyWebsite: string
  pricing: string
  productDescription: string
  headerColor: string
  features: string[]
}

// ─── Product Recommendations ─────────────────────────────
export interface ProductRecommendation {
  index?: number
  order?: number
  motivation: string
  title: string
  image?: string
  price?: string
  tags?: string[]
}
export interface ProductRecommendationsContent { title: string; introduction: string; products?: ProductRecommendation[] }

// ─── Case Study ──────────────────────────────────────────
export interface CaseStudyContent {
  title: string
  companyName?: string
  companyUrl?: string
  headerColor?: string
  results?: Array<{ metric: string; value: string; description?: string }>
  quote?: { text: string; author: string; role?: string }
}
