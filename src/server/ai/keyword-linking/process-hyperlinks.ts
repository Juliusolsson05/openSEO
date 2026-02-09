import { getOpenAIClient, MODELS } from '../clients';
import { parseJsonResponse } from '../utils';

export async function processHyperlinks(element: Record<string, unknown>) {
  try {
    const systemMessage =
      'You are responsible for taking a text paragraph and choosing the most relevant hyperlink positions to keep. Select 2-3 hyperlink positions and words that are most relevant to the text to make it more engaging. Each keyword should have exactly 1 matched position. Total matched positions across all keywords: minimum 2, maximum 3.';

    const messages = [
      { role: 'system' as const, content: systemMessage },
      { role: 'user' as const, content: JSON.stringify(element) },
    ];

    const response = await getOpenAIClient().chat.completions.create({
      model: MODELS.OPENAI_DEFAULT,
      messages,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'hyperlink_response',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              hyperlink: {
                type: 'object',
                properties: {
                  matched_keywords: {
                    type: 'object',
                    properties: {
                      text: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            keyword: { type: 'string' },
                            description: { type: 'string' },
                            matched_positions: { type: 'array', items: { type: 'integer' } },
                          },
                          required: ['keyword', 'description', 'matched_positions'],
                          additionalProperties: false,
                        },
                      },
                    },
                    required: ['text'],
                    additionalProperties: false,
                  },
                },
                required: ['matched_keywords'],
                additionalProperties: false,
              },
            },
            required: ['hyperlink'],
            additionalProperties: false,
          },
        },
      },
    });

    const result = parseJsonResponse<{ hyperlink: unknown }>(response);
    if (!result.hyperlink || typeof result.hyperlink !== 'object' || !(result.hyperlink as Record<string, unknown>).matched_keywords) {
      throw new Error('Invalid response structure from API');
    }

    element.hyperlink = result.hyperlink;
    return element;
  } catch {
    return element;
  }
}
