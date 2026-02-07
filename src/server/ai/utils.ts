import OpenAI from 'openai'

export function parseToolArguments(response: OpenAI.Chat.Completions.ChatCompletion): string {
  const message = response.choices[0]?.message
  const toolCall = message?.tool_calls?.[0] as { function?: { arguments?: string } } | undefined
  const toolArgs = toolCall?.function?.arguments
  if (toolArgs) return toolArgs
  const legacyArgs = (message as any)?.function_call?.arguments
  if (legacyArgs) return legacyArgs
  return message?.content ?? '{}'
}
