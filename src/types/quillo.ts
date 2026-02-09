/**
 * Quillo AI chat types — shared across analyze, continue-chat, and autopilot modules.
 */

/** Simple string-content chat message (OpenAI format). */
export type ChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/** Structured-content message (Anthropic format). */
export type StructuredMessage = {
  role: 'system' | 'user' | 'assistant'
  content: Array<{ type: 'text'; text: string }>
}
