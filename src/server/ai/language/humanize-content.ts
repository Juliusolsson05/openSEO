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
    'I believe this is a little bit too many cliche words and phrases.',
    'Great, take the text above and write it by choosing synonyms that are simple but that you might not choose by default to make it more unique and less AI. You should not make it too fancy. You should not at all change the subject, JUST the text phrasing to use words that you usually would not pick. You should not make it harder to read though, do not make it any fancier. But now is the time to clear up, do not make it so that it sounds we are writing for a toddler.',
    'Good, finally I want you to add a decent amount of em, strong, and br tags. If you write a br tag, write a double one.',
  ];

  constructor(schema: Record<string, unknown>) {
    this.systemPrompt = `You are a blog assistant, your goal is taking this paragraph, rewriting it in the exact same subject but making the content ALOT more useful by highlighting real-world examples, writing it more engaging like a blog and not make it sound like a robot but still not make it sound corny, and giving more credible insights that users actually can take action from. Another idea is writing in We format and not just lexion text, but this paragraph is still part of a larger post so do not write a conclusion or that type of bullshit, and also do not make up clients or information that just is not true.
    
IF YOU DO NOT FOLLOW THIS JSON SCHEMA IN ALL OF YOUR RESPONSES YOU BREAK EVERYTHING:

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
      max_completion_tokens: 1000,
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
        max_completion_tokens: 1000,
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
