import { RESTRICTED_BLOCK_SCHEMAS } from '../../constants/restricted-schemas';
import { getAnthropicClient, getOpenAIClient, MODELS } from '../../clients';

import type { StructuredMessage as Message } from '@/types/quillo'
export async function getContentImprovements(blogPost: unknown, messages: Message[]) {
  messages.push({ role: 'user', content: [{ type: 'text', text: `Improve content quality with tools enhance/humanize/regenerate. Current blog post: ${JSON.stringify(blogPost)}` }] });

  const responseSchema = {
    name: 'content_improvements',
    strict: true,
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
  } as const;

  const response = await getOpenAIClient().chat.completions.create({
    model: MODELS.OPENAI_DEFAULT,
    messages,
    response_format: { type: 'json_schema', json_schema: responseSchema },
  });

  messages.push({ role: 'assistant', content: [{ type: 'text', text: response.choices[0]?.message.content ?? '' }] });
  return { response, messages };
}

void getAnthropicClient;
