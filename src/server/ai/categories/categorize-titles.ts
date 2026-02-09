import { getOpenAIClient, MODELS } from '@/server/ai/clients';
import { parseToolArguments } from '@/server/ai/utils';

import type { Category } from '@/types/blog'

type Title = { id: number; title_text: string };

export async function categorizeTitles(
  titles: Title[],
  categories: Category[],
  language = 'en',
): Promise<Array<{ id: number; title_text: string; categories: Category[] }>> {
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  const allFormattedTitles: Array<{ id: number; title_text: string; categories: Category[] }> = [];
  const chunkSize = 10;

  for (let i = 0; i < titles.length; i += chunkSize) {
    const titlesChunk = titles.slice(i, i + chunkSize);
    const titlesList = titlesChunk.map((title) => ({ id: title.id, title: title.title_text }));
    const categoriesList = categories.map((category) => ({ id: category.id, name: category.name }));

    const functionParameters = {
      type: 'object',
      properties: Object.fromEntries(
        titlesChunk.map((_, j) => [
          `title_${j + 1}`,
          {
            type: 'object',
            properties: {
              id: { type: 'integer', description: `Title ID ${j + 1}` },
              categories: {
                type: 'array',
                items: { type: 'integer', description: 'Category ID' },
                description: `List of category IDs for title ${j + 1}`,
              },
            },
            required: ['id', 'categories'],
          },
        ]),
      ),
      required: titlesChunk.map((_, j) => `title_${j + 1}`),
    };

    const response = await getOpenAIClient().chat.completions.create({
      model: MODELS.OPENAI_SMART,
      messages: [
        {
          role: 'system',
          content:
            'You are an AI that categorizes a list of titles into the given categories. For each title, assign the most relevant categories based on the content of the title. Return the list of titles with the corresponding category IDs.',
        },
        {
          role: 'user',
          content: `Categorize the following titles into these categories: ${JSON.stringify(categoriesList)}\nTitles: ${JSON.stringify(titlesList)}`,
        },
      ],
      tools: [
        {
          type: 'function',
          function: {
            name: 'categorize_titles',
            description: 'Categorizes the provided titles into the provided categories.',
            parameters: functionParameters,
          },
        },
      ],
      tool_choice: { type: 'function', function: { name: 'categorize_titles' } },
    });

    const categorizedTitles = JSON.parse(parseToolArguments(response)) as Record<
      string,
      { id: number; categories: number[] }
    >;

    const formatted = Object.keys(categorizedTitles).map((key) => ({
      id: categorizedTitles[key].id,
      title_text: titles.find((t) => t.id === categorizedTitles[key].id)?.title_text ?? '',
      categories: categorizedTitles[key].categories.map((catId) => ({ id: catId, name: categoryMap[catId] })),
    }));

    allFormattedTitles.push(...formatted);
  }

  return allFormattedTitles;
}
