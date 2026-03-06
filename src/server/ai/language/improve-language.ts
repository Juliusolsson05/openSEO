import { getAnthropicClient, MODELS } from '@/server/ai/clients'
import { BLOCK_SCHEMAS } from '@/server/ai/constants/block-schemas'

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

  const msg = (text: string) => ({ role: 'user' as const, content: [{ type: 'text' as const, text }] })

  const client = await getAnthropicClient()
  const messages: Array<{ role: 'user' | 'assistant'; content: Array<{ type: 'text'; text: string }> }> = [
    msg(JSON.stringify(originalJsonContent)),
  ]

  let response = await client.messages.create({
    model: MODELS.ANTHROPIC_DEFAULT,
    max_tokens: 1000,
    temperature: 0.5,
    system: systemPrompt,
    messages,
  })

  let current = response.content[0]?.type === 'text' ? response.content[0].text : '{}'
  messages.push({ role: 'assistant', content: [{ type: 'text', text: current }] })

  for (const feedback of feedbackSteps) {
    messages.push(msg(feedback));
    response = await client.messages.create({
      model: MODELS.ANTHROPIC_DEFAULT,
      max_tokens: 1000,
      temperature: 0.5,
      system: systemPrompt,
      messages,
    })
    current = response.content[0]?.type === 'text' ? response.content[0].text : current
    messages.push({ role: 'assistant', content: [{ type: 'text', text: current }] })
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
