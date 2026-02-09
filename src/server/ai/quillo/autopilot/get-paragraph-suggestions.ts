import { getAnthropicClient, getOpenAIClient, MODELS } from '../../clients';

import type { StructuredMessage as Message } from '@/types/quillo'
export async function getParagraphSuggestions(blogPost: unknown, messages: Message[]) {
  messages.push({ role: 'user', content: [{ type: 'text', text: `Good, but now we have too many graphical elements. Add 4-5 paragraphs between graphical elements for smoother reading. Current blog post: ${JSON.stringify(blogPost)}` }] });

  const responseSchema = {
    name: 'paragraph_suggestions',
    strict: true,
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
