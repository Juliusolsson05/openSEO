import { getOpenAIClient, MODELS } from '../clients';
import { parseJsonResponse } from '../utils';

type TitleItem = { id: number; title: string };

export async function generateRecommendedPosts(titles: TitleItem[]) {
  try {
    const titlesList = titles.map((title) => ({ id: title.id, title: title.title }));

    const messages = [
      {
        role: 'system' as const,
        content:
          'You are an article recommender. Based on the given list of blog titles, recommend related posts for each title based on relevance, content similarity, and potential reader interest. Return the recommendations as a list of post IDs for each title. Make sure that titles do not recommend themselves and make it so that the recommendations are distributed evenly among all the titles.',
      },
      { role: 'user' as const, content: `Generate recommended post IDs for the following titles: ${JSON.stringify(titlesList)}` },
    ];

    const titleProperties: Record<string, any> = {};
    const requiredKeys: string[] = [];

    for (let i = 0; i < titles.length; i++) {
      const key = `title_${i + 1}`;
      titleProperties[key] = {
        type: 'array',
        items: { type: 'integer', description: `Recommended post ID for title ${i + 1}` },
      };
      requiredKeys.push(key);
    }

    const response = await (await getOpenAIClient()).chat.completions.create({
      model: MODELS.OPENAI_DEFAULT,
      messages,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'generate_recommended_posts',
          strict: true,
          schema: {
            type: 'object',
            properties: titleProperties,
            required: requiredKeys,
            additionalProperties: false,
          },
        },
      },
    });

    const recommendations = parseJsonResponse<Record<string, number[]>>(response);
    return titles.map((title, idx) => ({ id: title.id, title: title.title, recommended_posts: recommendations[`title_${idx + 1}`] ?? [] }));
  } catch (error) {
    return `An error occurred: ${error instanceof Error ? error.message : String(error)}`;
  }
}
