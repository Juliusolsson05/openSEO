import { getOpenAIClient } from '@/server/ai/clients';
import { parseToolArguments } from '@/server/ai/utils';

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

  const response = await getOpenAIClient().chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemMessage },
      {
        role: 'user',
        content: `Based on the following titles, generate a list of at least ${minCategories} categories. Provide the categories in ${language}:\n${JSON.stringify(titlesList)}`,
      },
    ],
    tools: [
      {
        type: 'function',
        function: {
          name: 'generate_categories',
          description: 'Generates a list of categories based on the provided blog titles.',
          parameters: {
            type: 'object',
            properties: {
              categories: {
                type: 'array',
                minItems: minCategories,
                items: { type: 'string', description: 'A relevant category generated from the titles' },
              },
            },
            required: ['categories'],
          },
        },
      },
    ],
    tool_choice: { type: 'function', function: { name: 'generate_categories' } },
  });

  const json = JSON.parse(parseToolArguments(response)) as { categories?: string[] };
  return json.categories ?? [];
}
