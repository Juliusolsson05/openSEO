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

export async function getImageSpecifications(blogPost: unknown, messages: Message[]) {
  messages.push({ role: 'user', content: [{ type: 'text', text: `Review this blog post and provide specs for existing images only. Include style_guide and per-image alt+description+element_id. Blog Post: ${JSON.stringify(blogPost)}` }] });

  const { system, messages: providerMessages } = flattenStructured(messages);

  const { text, raw } = await callModel({
    model: MODELS.OPENAI_DEFAULT,
    system,
    messages: providerMessages,
    jsonSchema: {
      name: 'image_specifications',
      schema: {
        type: 'object',
        properties: {
          style_guide: { type: 'string' },
          images: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                element_id: { type: 'integer' },
                alt_text: { type: 'string' },
                description: { type: 'string' },
              },
              required: ['element_id', 'alt_text', 'description'],
              additionalProperties: false,
            },
          },
        },
        required: ['style_guide', 'images'],
        additionalProperties: false,
      },
    },
  });

  messages.push({ role: 'assistant', content: [{ type: 'text', text: text ?? '' }] });
  const response = { choices: [{ message: { content: text ?? '' } }], raw };
  return { response, messages };
}
