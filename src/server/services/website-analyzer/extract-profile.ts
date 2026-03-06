/**
 * AI-powered company profile extraction.
 *
 * Takes scraped website text and returns a structured company profile
 * that gets injected into all content generation as context.
 */

import { getOpenAIClient, MODELS } from '@/server/ai/clients'
import type { ScrapedPage } from './scraper'

// Uses MODELS.OPENAI_SMART for high-quality structured extraction

export type CompanyProfile = {
  /** 2-3 sentence summary of what the company does */
  business_description: string
  /** Specific industry/vertical (not just "Technology") */
  industry: string
  /** Who they sell to — be specific */
  target_audience: string
  /** Tone descriptors, e.g. ["professional", "approachable", "technical"] */
  tone_of_voice: string[]
  /** Core products or services offered */
  products_services: string[]
  /** Domain-specific terms they use naturally */
  key_terminology: string[]
  /** Topics they already cover or should cover */
  content_topics: string[]
  /** What makes them different — USPs */
  differentiators: string[]
  /** Detected language of the website content */
  detected_language: string
  /** Raw scrape metadata */
  _scraped_at: string
  _pages_analyzed: number
}

const SYSTEM_PROMPT = `You are a business analyst. Given scraped text from a company's website, extract a structured profile.

Be SPECIFIC, not generic. "B2B SaaS for construction project management" not "Technology company".
Extract what's actually on their site, don't invent or assume.
If information isn't available for a field, use an empty array or empty string.
For tone_of_voice, analyze the actual writing style — look at word choice, sentence structure, formality level.

Return valid JSON matching this exact schema:
{
  "business_description": "2-3 sentences about what they do",
  "industry": "specific industry/vertical",
  "target_audience": "who they sell to",
  "tone_of_voice": ["descriptor1", "descriptor2", "descriptor3"],
  "products_services": ["product/service 1", "product/service 2"],
  "key_terminology": ["term1", "term2"],
  "content_topics": ["topic1", "topic2"],
  "differentiators": ["what makes them different"],
  "detected_language": "en"
}

Return ONLY the JSON object. No markdown, no code fences, no explanation.`

function buildUserPrompt(pages: ScrapedPage[]): string {
  const sections = pages.map((page, i) => {
    const parts = [`--- Page ${i + 1}: ${page.url} ---`]
    if (page.title) parts.push(`Title: ${page.title}`)
    if (page.description) parts.push(`Meta description: ${page.description}`)
    // Limit text per page to keep within context window
    parts.push(page.text.slice(0, 8000))
    return parts.join('\n')
  })

  return `Analyze this company's website and extract a structured profile:\n\n${sections.join('\n\n')}`
}

export async function extractCompanyProfile(pages: ScrapedPage[]): Promise<CompanyProfile> {
  const client = await getOpenAIClient()

  const response = await client.chat.completions.create({
    model: MODELS.OPENAI_SMART,
    temperature: 0.1,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(pages) },
    ],
  })

  const raw = response.choices[0]?.message?.content ?? '{}'

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(raw)
  } catch {
    // Try stripping markdown fences
    const cleaned = raw.replace(/^```json?\s*/i, '').replace(/```$/i, '').trim()
    parsed = JSON.parse(cleaned)
  }

  return {
    business_description: String(parsed.business_description ?? ''),
    industry: String(parsed.industry ?? ''),
    target_audience: String(parsed.target_audience ?? ''),
    tone_of_voice: Array.isArray(parsed.tone_of_voice) ? parsed.tone_of_voice.map(String) : [],
    products_services: Array.isArray(parsed.products_services) ? parsed.products_services.map(String) : [],
    key_terminology: Array.isArray(parsed.key_terminology) ? parsed.key_terminology.map(String) : [],
    content_topics: Array.isArray(parsed.content_topics) ? parsed.content_topics.map(String) : [],
    differentiators: Array.isArray(parsed.differentiators) ? parsed.differentiators.map(String) : [],
    detected_language: String(parsed.detected_language ?? 'en'),
    _scraped_at: new Date().toISOString(),
    _pages_analyzed: pages.length,
  }
}
