import { RESTRICTED_BLOCK_SCHEMAS } from '../../constants/restricted-schemas';
import { MODELS } from '../../clients';
import { callModel } from '../../providers';

import type { StructuredMessage as Message } from '@/types/quillo'

export async function getElementSuggestions(blogPost: unknown) {
  const messages: Message[] = [
    { role: 'system', content: [{ type: 'text', text: 'You are a specialized AI assistant focused on enhancing blog post content. Suggest around 5-6 useful elements and never suggest anything after FAQ/conclusion.' }] },
    { role: 'user', content: [{ type: 'text', text: `Review this blog post and suggest what elements to add: ${JSON.stringify(blogPost)} Available Element Types: ${JSON.stringify(RESTRICTED_BLOCK_SCHEMAS)}` }] },
  ];

  const { text, raw } = await callModel({
    model: MODELS.OPENAI_DEFAULT,
    system: messages[0].content[0].text,
    messages: [{ role: 'user', content: messages[1].content[0].text }],
    jsonSchema: {
      name: 'blog_improvement_suggestions',
      schema: {
        type: 'object',
        properties: {
          recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                element_type: { type: 'string', enum: Object.keys(RESTRICTED_BLOCK_SCHEMAS) },
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
