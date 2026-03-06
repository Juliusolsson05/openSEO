import { getOpenAIClient, MODELS } from '@/server/ai/clients';
import { parseJsonResponse } from '@/server/ai/utils';

export async function generateCategories(
  titles: string[],
  language = 'en',
  minCategories = 6,
  additionalPrompt?: string,
): Promise<string[]> {
  const titlesList = titles.map((title) => ({ title }));

  let systemMessage =
    'You are an AI trained to analyze a list of blog titles and generate a list of relevant categories. Each category should be broad enough to encompass multiple titles but specific enough to be meaningful. Ensure that at least 6 categories are generated and that they are concise, relevant, and useful for classifying and organizing content.';

  if (additionalPrompt) systemMessage = `${additionalPrompt}\n\n${systemMessage}`;

  const response = await (await getOpenAIClient()).chat.completions.create({
    model: MODELS.OPENAI_SMART,
    messages: [
      { role: 'system', content: systemMessage },
      {
        role: 'user',
        content: `Based on the following titles, generate a list of at least ${minCategories} categories. Provide the categories in ${language}:\n${JSON.stringify(titlesList)}`,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'generate_categories',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            categories: {
              type: 'array',
              items: { type: 'string', description: 'A relevant category generated from the titles' },
            },
          },
          required: ['categories'],
          additionalProperties: false,
        },
      },
    },
  });

  const json = parseJsonResponse<{ categories?: string[] }>(response);
  return json.categories ?? [];
}
