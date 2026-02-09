import { getOpenAIClient, MODELS } from '@/server/ai/clients';
import {
  COMMON_ELEMENTS,
  MANDATORY_ELEMENTS,
  STRUCTURE_SYSTEM_PROMPT,
  STRUCTURE_USER_PROMPT,
} from '@/server/ai/constants/structure-constants';
import { parseJsonResponse } from '@/server/ai/utils';

export async function generateStructure(
  titleText: string,
  model = MODELS.OPENAI_SMART,
  allowedElements?: Record<string, boolean>,
): Promise<{ structure: Record<string, unknown>; usage: unknown }> {
  const filteredCommonElements =
    allowedElements == null
      ? COMMON_ELEMENTS
      : COMMON_ELEMENTS.filter((element) => allowedElements[element.type]);

  const response = await getOpenAIClient().chat.completions.create({
    model,
    messages: [
      { role: 'system', content: STRUCTURE_SYSTEM_PROMPT.replace('{title}', titleText) },
      { role: 'user', content: STRUCTURE_USER_PROMPT.replace('{title}', titleText) },
      {
        role: 'system',
        content: JSON.stringify({ Mandatory: MANDATORY_ELEMENTS, 'Common Elements': filteredCommonElements }, null, 4),
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'generate_blog_structure',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            blocks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  order: { type: 'integer' },
                  description: { type: 'string' },
                  requirements: { type: 'string' },
                },
                required: ['type', 'order', 'description', 'requirements'],
                additionalProperties: false,
              },
            },
          },
          required: ['blocks'],
          additionalProperties: false,
        },
      },
    },
  });

  const structure = parseJsonResponse<Record<string, unknown>>(response);
  return { structure, usage: response.usage };
}
