import { getOpenAIClient } from '@/server/ai/clients';
import {
  COMMON_ELEMENTS,
  MANDATORY_ELEMENTS,
  STRUCTURE_SYSTEM_PROMPT,
  STRUCTURE_USER_PROMPT,
} from '@/server/ai/constants/structure-constants';
import { parseToolArguments } from '@/server/ai/utils';

export async function generateStructure(
  titleText: string,
  model = 'gpt-5.2',
  allowedElements?: Record<string, boolean>,
): Promise<{ structure: Record<string, unknown>; usage: unknown }> {
  const filteredCommonElements =
    allowedElements == null
      ? COMMON_ELEMENTS
      : COMMON_ELEMENTS.filter((element) => allowedElements[element.type]);

  const functionParameters = {
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
        },
      },
    },
    required: ['blocks'],
  };

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
    tools: [
      {
        type: 'function',
        function: {
          name: 'generate_blog_structure',
          description: 'Generates a blog post structure based on the given title.',
          parameters: functionParameters,
        },
      },
    ],
    tool_choice: { type: 'function', function: { name: 'generate_blog_structure' } },
  });

  const structure = JSON.parse(parseToolArguments(response)) as Record<string, unknown>;
  return { structure, usage: response.usage };
}
