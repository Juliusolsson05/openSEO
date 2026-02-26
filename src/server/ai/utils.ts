import OpenAI from 'openai'

export function parseToolArguments(response: OpenAI.Chat.Completions.ChatCompletion): string {
  const message = response.choices[0]?.message
  const toolCall = message?.tool_calls?.[0] as { function?: { arguments?: string } } | undefined
  const toolArgs = toolCall?.function?.arguments
  if (toolArgs) return toolArgs
  return message?.content ?? '{}'
}

/**
 * Parse the JSON content from a response that used `response_format: json_schema`.
 * Returns the parsed object, or throws if the model refused or content is missing.
 */
export function parseJsonResponse<T = unknown>(response: OpenAI.Chat.Completions.ChatCompletion): T {
  const message = response.choices[0]?.message
  const finishReason = response.choices[0]?.finish_reason
  if (message?.refusal) {
    throw new Error(`Model refused to respond: ${message.refusal}`)
  }
  if (finishReason === 'length') {
    throw new Error('Generation hit token limit — response was cut off. Try a simpler element or shorter context.')
  }
  const content = message?.content
  if (!content) {
    throw new Error(`No content in response (finish_reason: ${finishReason})`)
  }
  return JSON.parse(content) as T
}

/**
 * Make a JSON schema compatible with OpenAI strict structured outputs.
 * - Adds `additionalProperties: false` to every object
 * - Ensures all properties are listed in `required`
 * - Handles nested objects and arrays recursively
 */
export function toStrictSchema(schema: Record<string, any>): Record<string, any> {
  if (!schema || typeof schema !== 'object') return schema

  const result = { ...schema }

  if (result.type === 'object' && result.properties) {
    // Ensure all property keys are in required
    result.required = Object.keys(result.properties)
    result.additionalProperties = false

    const props: Record<string, any> = {}
    for (const [key, value] of Object.entries(result.properties)) {
      props[key] = toStrictSchema(value as Record<string, any>)
    }
    result.properties = props
  }

  if (result.type === 'array' && result.items) {
    result.items = toStrictSchema(result.items as Record<string, any>)
  }

  // Handle anyOf / oneOf
  if (result.anyOf) {
    result.anyOf = result.anyOf.map((s: any) => toStrictSchema(s))
  }
  if (result.oneOf) {
    result.oneOf = result.oneOf.map((s: any) => toStrictSchema(s))
  }

  return result
}
