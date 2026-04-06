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
