// ─── Element Content Types ────────────────────────────────────

export interface IntroductionContent {
  text: string
}

export interface VerdictContent {
  tool_a_verdict: string
  tool_b_verdict: string
}

export interface OverviewTableRow {
  label: string
  tool_a: string
  tool_b: string
}

export interface OverviewTableContent {
  rows: OverviewTableRow[]
}

export interface FeatureComparisonContent {
  category: string
  tool_a_score: number
  tool_b_score: number
  tool_a_note: string
  tool_b_note: string
}

export interface PricingPlan {
  name: string
  price: string
  features: string[]
}

export interface PricingComparisonContent {
  tool_a_plans: PricingPlan[]
  tool_b_plans: PricingPlan[]
}

export interface ProsConsContent {
  tool_a_pros: string[]
  tool_a_cons: string[]
  tool_b_pros: string[]
  tool_b_cons: string[]
}

export interface ParagraphContent {
  title?: string
  text: string
}

export interface FAQItem {
  question: string
  answer: string
}

export interface FAQContent {
  items: FAQItem[]
}

export interface ScoreDimension {
  label: string
  tool_a: number
  tool_b: number
}

export interface ScoreSummaryContent {
  dimensions: ScoreDimension[]
}

export interface AuroraCTAContent {
  headline?: string
  text?: string
}

// ─── Element Type Registry ────────────────────────────────────

export const ELEMENT_TYPES = [
  'introduction',
  'verdict',
  'overview_table',
  'feature_comparison',
  'pricing_comparison',
  'pros_cons',
  'paragraph',
  'faq',
  'score_summary',
  'aurora_cta',
] as const

export type ElementType = (typeof ELEMENT_TYPES)[number]

// ─── Content type map ─────────────────────────────────────────

export type ElementContentMap = {
  introduction: IntroductionContent
  verdict: VerdictContent
  overview_table: OverviewTableContent
  feature_comparison: FeatureComparisonContent
  pricing_comparison: PricingComparisonContent
  pros_cons: ProsConsContent
  paragraph: ParagraphContent
  faq: FAQContent
  score_summary: ScoreSummaryContent
  aurora_cta: AuroraCTAContent
}

// ─── DB-aligned types (for components) ────────────────────────

export interface ComparisonToolData {
  id: number
  name: string
  slug: string
  tagline: string | null
  website_url: string | null
  logo_url: string | null
  description: string
}

export interface ComparisonElementData {
  id: number
  element_type: string
  order: number
  content: unknown
}

export interface ComparisonData {
  id: number
  slug: string
  title: string | null
  meta_description: string | null
  published: boolean
  published_at: Date | null
  created_at: Date
  updated_at: Date
  tool_a: ComparisonToolData
  tool_b: ComparisonToolData
  elements: ComparisonElementData[]
}

export interface ComparisonListItem {
  id: number
  slug: string
  title: string | null
  created_at: Date
  tool_a: Pick<ComparisonToolData, 'name' | 'slug'>
  tool_b: Pick<ComparisonToolData, 'name' | 'slug'>
}
