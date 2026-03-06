import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

import { getAnthropic } from '@/lib/providers/anthropic'
import { getOpenAI } from '@/lib/providers/openai'

let _openai: OpenAI | null = null
let _anthropic: Anthropic | null = null

export async function getOpenAIClient(): Promise<OpenAI> {
  if (!_openai) _openai = await getOpenAI()
  return _openai
}

export async function getAnthropicClient(): Promise<Anthropic> {
  if (!_anthropic) {
    _anthropic = await getAnthropic()
  }
  return _anthropic
}

export const MODELS = {
  OPENAI_DEFAULT: 'gpt-5-mini',
  OPENAI_SMART: 'gpt-5.2',
  ANTHROPIC_DEFAULT: 'claude-sonnet-4-5-20250929',
} as const
