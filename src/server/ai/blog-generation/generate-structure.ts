import { MODELS } from '@/server/ai/clients';
import {
  COMMON_ELEMENTS,
  MANDATORY_ELEMENTS,
  STRUCTURE_SYSTEM_PROMPT,
  STRUCTURE_USER_PROMPT,
} from '@/server/ai/constants/structure-constants';
import { callModel } from '@/server/ai/providers';

export async function generateStructure(
  titleText: string,
  model = MODELS.OPENAI_SMART,
  allowedElements?: Record<string, boolean>,
): Promise<{ structure: Record<string, unknown>; usage: unknown }> {
  const filteredCommonElements =
    allowedElements == null
      ? COMMON_ELEMENTS
      : COMMON_ELEMENTS.filter((element) => allowedElements[element.type]);

  const { json, usage, raw } = await callModel<Record<string, unknown>>({
    model,
    system: STRUCTURE_SYSTEM_PROMPT.replace('{title}', titleText),
    messages: [
      { role: 'user', content: STRUCTURE_USER_PROMPT.replace('{title}', titleText) },
      {
        role: 'user',
        content: JSON.stringify(
          { Mandatory: MANDATORY_ELEMENTS, 'Common Elements': filteredCommonElements },
          null,
          4,
        ),
      },
    ],
    jsonSchema: {
      name: 'generate_blog_structure',
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
  });

  if (!json) throw new Error('generate-structure: no JSON returned from model');
  // Preserve original return shape: callers may have read provider-specific usage fields.
  // Prefer the raw usage object when available for back-compat; fall back to normalized usage.
  const rawUsage =
    (raw as { usage?: unknown } | undefined)?.usage ?? usage;
  return { structure: json, usage: rawUsage };
}
