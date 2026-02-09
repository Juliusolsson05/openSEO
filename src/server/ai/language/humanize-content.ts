import { getAnthropicClient, MODELS } from '@/server/ai/clients';
import { BLOCK_SCHEMAS } from '@/server/ai/constants/block-schemas';

export function getHumanizeFunctionSchema(elementType: string): Record<string, unknown> {
  const blockSchema = (BLOCK_SCHEMAS as Record<string, unknown>)[elementType] ?? {};
  return {
    type: 'object',
    properties: {
      block: {
        type: 'object',
        properties: { content: blockSchema },
        required: ['content'],
      },
    },
    required: ['block'],
  };
}

export class ContentProcessor {
  private client = getAnthropicClient();
  private systemPrompt: string;
  private feedbackSteps = [
    'The text still has too many cliché words and default AI phrases. Replace words like "crucial", "comprehensive", "leverage", "landscape", and "furthermore" with simpler, more natural alternatives.',
    'Rephrase using varied vocabulary — pick words you would not normally default to, but keep them simple and natural. Do not make the text fancy or harder to read. Do not change the subject or meaning. The goal is text that sounds like a knowledgeable person wrote it, not an AI.',
    'Add formatting: use <strong> for 2-3 key concepts per text block, <em> for 1-2 emphasis points, and <br><br> between distinct ideas. Do not overdo it.',
  ];

  constructor(schema: Record<string, unknown>) {
    this.systemPrompt = `You are a blog editor. Your goal is to take this content and rewrite it to be genuinely useful and engaging.

Rewrite rules:
- Keep the exact same subject and key points — only change HOW it is written, not WHAT it says.
- Make the content specific: add real-world examples, named companies, or concrete outcomes where the original is vague.
- Write in a natural, conversational tone — like explaining to a smart colleague, not a boardroom.
- Use "we" format when appropriate (this is part of a company blog).
- This is a single section within a larger post — do not add introductory or concluding sentences about the overall post.
- Do not make up clients or data that is not plausible.

YOU MUST RETURN VALID JSON MATCHING THIS SCHEMA:
${JSON.stringify(schema, null, 2)}`;
  }

  private createMessageObject(text: string) {
    return { role: 'user' as const, content: [{ type: 'text' as const, text }] };
  }

  async processContent(initialText: string): Promise<string[]> {
    const messages: Array<{ role: 'user' | 'assistant'; content: Array<{ type: 'text'; text: string }> }> = [];
    const responses: string[] = [];

    messages.push(this.createMessageObject(initialText));
    let response = await this.client.messages.create({
      model: MODELS.ANTHROPIC_DEFAULT,
      max_tokens: 1000,
      temperature: 0.5,
      system: this.systemPrompt,
      messages,
    });

    let currentResponse = response.content[0]?.type === 'text' ? response.content[0].text : '';
    responses.push(currentResponse);
    messages.push({ role: 'assistant', content: [{ type: 'text', text: currentResponse }] });

    for (const feedback of this.feedbackSteps) {
      messages.push(this.createMessageObject(feedback));
      response = await this.client.messages.create({
        model: MODELS.ANTHROPIC_DEFAULT,
        max_tokens: 1000,
        temperature: 0.5,
        system: this.systemPrompt,
        messages,
      });
      currentResponse = response.content[0]?.type === 'text' ? response.content[0].text : currentResponse;
      responses.push(currentResponse);
      messages.push({ role: 'assistant', content: [{ type: 'text', text: currentResponse }] });
    }

    return responses;
  }
}
