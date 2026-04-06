import { RESTRICTED_BLOCK_SCHEMAS } from '../../constants/restricted-schemas';
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

export async function getContentImprovements(blogPost: unknown, messages: Message[]) {
  messages.push({ role: 'user', content: [{ type: 'text', text: `Improve content quality with tools enhance/humanize/regenerate. Current blog post: ${JSON.stringify(blogPost)}` }] });

  const { system, messages: providerMessages } = flattenStructured(messages);

  const { text, raw } = await callModel({
    model: MODELS.OPENAI_DEFAULT,
    system,
    messages: providerMessages,
    jsonSchema: {
      name: 'content_improvements',
      schema: {
        type: 'object',
        properties: {
          element_improvements: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                element_id: { type: 'integer' },
                element_type: { type: 'string', enum: Object.keys(RESTRICTED_BLOCK_SCHEMAS) },
                tools: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      tool_name: { type: 'string', enum: ['enhance', 'humanize', 'regenerate'] },
                      application_order: { type: 'integer' },
                      reason: { type: 'string' },
                    },
                    required: ['tool_name', 'application_order', 'reason'],
                    additionalProperties: false,
                  },
                },
                expected_improvements: { type: 'string' },
              },
              required: ['element_id', 'element_type', 'tools', 'expected_improvements'],
              additionalProperties: false,
            },
          },
        },
        required: ['element_improvements'],
        additionalProperties: false,
      },
    },
  });

  messages.push({ role: 'assistant', content: [{ type: 'text', text: text ?? '' }] });
  // Preserve OpenAI-shaped response for backward compat with quillo.service.ts readers.
  const response = { choices: [{ message: { content: text ?? '' } }], raw };
  return { response, messages };
}
