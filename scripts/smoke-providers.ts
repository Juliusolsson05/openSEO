/**
 * Smoke test for the provider abstraction. Requires the three env vars to be set
 * in the vault (or via `.env.local` that the vault reads from). Run with:
 *
 *   cd openseo && npx tsx --import ./scripts/smoke-providers-preload.mjs scripts/smoke-providers.ts
 *
 * The preload file shims the `server-only` module so vault imports work under
 * plain tsx (without the Next bundler that normally provides that module).
 */
import { callModel } from '@/server/ai/providers'

async function main() {
  const cases: Array<{ label: string; model: string }> = [
    { label: 'openai', model: 'gpt-5-mini' },
    { label: 'anthropic', model: 'claude-sonnet-4-5-20250929' },
    { label: 'google', model: 'gemini-2.5-pro' },
  ]

  for (const c of cases) {
    try {
      const result = await callModel<{ answer: string }>({
        model: c.model,
        system: 'You answer in one short sentence.',
        messages: [{ role: 'user', content: 'Say hello and include the word "openseo".' }],
        maxTokens: 200,
        jsonSchema: {
          name: 'hello',
          schema: {
            type: 'object',
            properties: { answer: { type: 'string' } },
            required: ['answer'],
            additionalProperties: false,
          },
        },
      })
      console.log(
        `[PASS] ${c.label} (${c.model}) provider=${result.provider} ` +
          `tokens=${result.usage.totalTokens} answer=${result.json?.answer}`,
      )
    } catch (err) {
      console.error(`[FAIL] ${c.label} (${c.model}):`, err)
      process.exitCode = 1
    }
  }
}

void main()
