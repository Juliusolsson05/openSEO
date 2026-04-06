import { MODELS } from '../../clients';
import { callModel, type ChatMessage as ProviderMessage } from '../../providers';

import type { StructuredMessage as Message } from '@/types/quillo'

function flattenStructured(msgs: Message[]): { system?: string; messages: ProviderMessage[] } {
  let system: string | undefined;
  const messages: ProviderMessage[] = [];
  for (const m of msgs) {
    const text = m.content.map((c) => c.text).join('\n');
    if (m.role === 'system') {
      system = system ? `${system}\n${text}` : text;
    } else {
      messages.push({ role: m.role, content: text });
    }
  }
  return { system, messages };
}

export async function getParagraphSuggestions(blogPost: unknown, messages: Message[]) {
  messages.push({ role: 'user', content: [{ type: 'text', text: `Good, but now we have too many graphical elements. Add 4-5 paragraphs between graphical elements for smoother reading. Current blog post: ${JSON.stringify(blogPost)}` }] });

  const { system, messages: providerMessages } = flattenStructured(messages);

  const { text, raw } = await callModel({
    model: MODELS.OPENAI_DEFAULT,
    system,
    messages: providerMessages,
    jsonSchema: {
      name: 'paragraph_suggestions',
      schema: {
        type: 'object',
        properties: {
          recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                element_type: { type: 'string', enum: ['paragraph', 'list_paragraph', 'numbered_list_paragraph'] },
                content_description: { type: 'string' },
                location: { type: 'object', properties: { after_element_id: { type: 'integer' } }, required: ['after_element_id'], additionalProperties: false },
                motivation: { type: 'string' },
              },
              required: ['element_type', 'content_description', 'location', 'motivation'],
              additionalProperties: false,
            },
          },
        },
        required: ['recommendations'],
        additionalProperties: false,
      },
    },
  });

  messages.push({ role: 'assistant', content: [{ type: 'text', text: text ?? '' }] });
  const response = { choices: [{ message: { content: text ?? '' } }], raw };
  return { response, messages };
}
