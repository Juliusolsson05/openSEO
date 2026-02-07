import { getAnthropicClient, MODELS } from '@/server/ai/clients';
import { BLOCK_SCHEMAS } from '@/server/ai/constants/block-schemas';

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
  };

  const systemPrompt = `You are a blog assistant, rewrite this content on same subject, more useful and engaging, avoid clichés and false claims.
Element type: ${elementType}
JSON schema:
${JSON.stringify(schema, null, 2)}`;

  const feedbackSteps = [
    'Too many cliché words and phrases.',
    'Rewrite with simpler but less default word choices; keep meaning.',
    'Keep it professional; remove goofy phrasing.',
    'Add a decent amount of em/strong and double br tags, but sparingly.',
  ];

  const msg = (text: string) => ({ role: 'user' as const, content: [{ type: 'text' as const, text }] });

  const client = getAnthropicClient();
  const messages: Array<{ role: 'user' | 'assistant'; content: Array<{ type: 'text'; text: string }> }> = [
    msg(JSON.stringify(originalJsonContent)),
  ];

  let response = await client.messages.create({
    model: MODELS.ANTHROPIC_DEFAULT,
    max_tokens: 1000,
    temperature: 0.5,
    system: systemPrompt,
    messages,
  });

  let current = response.content[0]?.type === 'text' ? response.content[0].text : '{}';
  messages.push({ role: 'assistant', content: [{ type: 'text', text: current }] });

  for (const feedback of feedbackSteps) {
    messages.push(msg(feedback));
    response = await client.messages.create({
      model: MODELS.ANTHROPIC_DEFAULT,
      max_tokens: 1000,
      temperature: 0.5,
      system: systemPrompt,
      messages,
    });
    current = response.content[0]?.type === 'text' ? response.content[0].text : current;
    messages.push({ role: 'assistant', content: [{ type: 'text', text: current }] });
  }

  return JSON.parse(current);
}
