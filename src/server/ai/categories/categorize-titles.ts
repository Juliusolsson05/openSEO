import { MODELS } from '@/server/ai/clients';
import { callModel } from '@/server/ai/providers';

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

    const titleProperties: Record<string, any> = {};
    const requiredKeys: string[] = [];

    for (let j = 0; j < titlesChunk.length; j++) {
      const key = `title_${j + 1}`;
      titleProperties[key] = {
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
        additionalProperties: false,
      };
      requiredKeys.push(key);
    }

    const { json: categorizedTitles } = await callModel<
      Record<string, { id: number; categories: number[] }>
    >({
      model: MODELS.OPENAI_SMART,
      system:
        'You are an AI that categorizes a list of titles into the given categories. For each title, assign the most relevant categories based on the content of the title. Return the list of titles with the corresponding category IDs.',
      messages: [
        {
          role: 'user',
          content: `Categorize the following titles into these categories: ${JSON.stringify(categoriesList)}\nTitles: ${JSON.stringify(titlesList)}`,
        },
      ],
      jsonSchema: {
        name: 'categorize_titles',
        schema: {
          type: 'object',
          properties: titleProperties,
          required: requiredKeys,
          additionalProperties: false,
        },
      },
    });

    if (!categorizedTitles) throw new Error('categorize-titles: no JSON returned');

    const formatted = Object.keys(categorizedTitles).map((key) => ({
      id: categorizedTitles[key].id,
      title_text: titles.find((t) => t.id === categorizedTitles[key].id)?.title_text ?? '',
      categories: categorizedTitles[key].categories.map((catId) => ({ id: catId, name: categoryMap[catId] })),
    }));

    allFormattedTitles.push(...formatted);
  }

  return allFormattedTitles;
}
