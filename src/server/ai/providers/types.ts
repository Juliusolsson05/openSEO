export type Provider = 'openai' | 'anthropic' | 'google'

export type Role = 'system' | 'user' | 'assistant'

export interface ChatMessage {
  role: Role
  content: string
}

export interface CallModelOptions {
  model: string
  system?: string
  messages: ChatMessage[]
  temperature?: number
  maxTokens?: number
  jsonSchema?: { name: string; schema: Record<string, unknown>; strict?: boolean }
}

export interface NormalizedUsage {
  inputTokens: number
  outputTokens: number
  totalTokens: number
}

export interface CallModelResult<T = unknown> {
  text: string
  json?: T
  usage: NormalizedUsage
  provider: Provider
  raw: unknown
}
