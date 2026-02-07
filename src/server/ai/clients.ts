import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

let _openai: OpenAI | null = null;
let _anthropic: Anthropic | null = null;

export function getOpenAIClient(): OpenAI {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openai;
}

export function getAnthropicClient(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _anthropic;
}

export const MODELS = {
  OPENAI_DEFAULT: 'gpt-4o-mini',
  OPENAI_SMART: 'gpt-4o',
  ANTHROPIC_DEFAULT: 'claude-sonnet-4-5-20250929',
} as const;
