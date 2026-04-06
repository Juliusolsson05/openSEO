import { MODELS } from '../clients';
import { callModel } from '../providers';

type TitleItem = { id: number; title: string };

export async function generateRecommendedPosts(titles: TitleItem[]) {
  try {
    const titlesList = titles.map((title) => ({ id: title.id, title: title.title }));

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

    const { json: recommendations } = await callModel<Record<string, number[]>>({
      model: MODELS.OPENAI_DEFAULT,
      system:
        'You are an article recommender. Based on the given list of blog titles, recommend related posts for each title based on relevance, content similarity, and potential reader interest. Return the recommendations as a list of post IDs for each title. Make sure that titles do not recommend themselves and make it so that the recommendations are distributed evenly among all the titles.',
      messages: [
        { role: 'user', content: `Generate recommended post IDs for the following titles: ${JSON.stringify(titlesList)}` },
      ],
      jsonSchema: {
        name: 'generate_recommended_posts',
        schema: {
          type: 'object',
          properties: titleProperties,
          required: requiredKeys,
          additionalProperties: false,
        },
      },
    });

    if (!recommendations) throw new Error('generate-recommended-posts: no JSON returned');
    return titles.map((title, idx) => ({ id: title.id, title: title.title, recommended_posts: recommendations[`title_${idx + 1}`] ?? [] }));
  } catch (error) {
    return `An error occurred: ${error instanceof Error ? error.message : String(error)}`;
  }
}
