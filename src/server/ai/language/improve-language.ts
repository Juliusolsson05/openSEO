import { MODELS } from '@/server/ai/clients'
import { BLOCK_SCHEMAS } from '@/server/ai/constants/block-schemas'
import { callModel, type ChatMessage } from '@/server/ai/providers'

export async function improveLanguage(
  elementType: string,
  title: string,
  originalJsonContent: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const schema = {
    type: 'object',
    properties: {
      block: {
        type: 'object',
        properties: { content: (BLOCK_SCHEMAS as Record<string, unknown>)[elementType] ?? {} },
        required: ['content'],
      },
    },
    required: ['block'],
  }

  const systemPrompt = `You are a blog editor. Rewrite this content on the same subject to be more useful, engaging, and specific. Avoid clichés and vague claims. Add concrete examples where the original is abstract.

Element type: ${elementType}

Return valid JSON matching this schema:
${JSON.stringify(schema, null, 2)}`

  const feedbackSteps = [
    'Still too many cliché words and default AI phrases. Replace "crucial", "comprehensive", "leverage", "landscape", "furthermore" with natural alternatives.',
    'Rephrase with varied but simple vocabulary — words that sound natural and human, not AI-default. Do not change the subject or make it harder to read.',
    'Keep it professional and clear. Remove any awkward or forced phrasing.',
    'Add formatting: <strong> for 2-3 key concepts per text block, <em> for 1-2 emphasis points, <br><br> between distinct ideas. Use sparingly.',
  ]

  const messages: ChatMessage[] = [
    { role: 'user', content: JSON.stringify(originalJsonContent) },
  ]

  let result = await callModel({
    model: MODELS.ANTHROPIC_DEFAULT,
    system: systemPrompt,
    messages,
    temperature: 0.5,
    maxTokens: 1000,
  })

  let current = result.text || '{}'
  messages.push({ role: 'assistant', content: current })

  for (const feedback of feedbackSteps) {
    messages.push({ role: 'user', content: feedback })
    result = await callModel({
      model: MODELS.ANTHROPIC_DEFAULT,
      system: systemPrompt,
      messages,
      temperature: 0.5,
      maxTokens: 1000,
    })
    current = result.text || current
    messages.push({ role: 'assistant', content: current })
  }

  // Strip markdown code fences if present (```json ... ```)
  let cleaned = current.trim()
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '')
  }

  try {
    return JSON.parse(cleaned)
  } catch (e) {
    console.error('[improveLanguage] Failed to parse AI response as JSON:', cleaned.slice(0, 500))
    throw new Error(`AI returned invalid JSON: ${e instanceof Error ? e.message : String(e)}`)
  }
}
