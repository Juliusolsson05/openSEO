import { getAnthropicClient, getOpenAIClient, MODELS } from '../clients';

type TitleItem = { id: number; title: string };

export async function generateRecommendedPosts(titles: TitleItem[]) {
  try {
    const titlesList = titles.map((title) => ({ id: title.id, title: title.title }));

    const messages = [
      {
        role: 'system' as const,
        content:
          'You are an article recommender. Based on the given list of blog titles, recommend related posts for each title based on relevance, content similarity, and potential reader interest. Return the recommendations as a list of post IDs for each title. Make sure that titles do not recommend itself and make it so that the recommendations are distributed evenly among all the titles. Make the recommendations based on what is most logical.',
      },
      { role: 'user' as const, content: `Generate recommended post IDs for the following titles: ${JSON.stringify(titlesList)}` },
    ];

    const functionParameters = {
      type: 'object',
      properties: Object.fromEntries(
        Array.from({ length: titles.length }, (_, idx) => [
          `title_${idx + 1}`,
          { type: 'array', items: { type: 'integer', description: `Recommended post ID for title ${idx + 1}` } },
        ]),
      ),
      required: Array.from({ length: titles.length }, (_, idx) => `title_${idx + 1}`),
    };

    const response = await getOpenAIClient().chat.completions.create({
      model: MODELS.OPENAI_DEFAULT,
      messages,
      tools: [{
        type: 'function' as const,
        function: { name: 'generate_recommended_posts', description: 'Generates recommended post IDs based on the given titles.', parameters: functionParameters },
      }],
      tool_choice: { type: 'function' as const, function: { name: 'generate_recommended_posts' } },
    });

    const recommendations = JSON.parse((response.choices[0]?.message?.tool_calls?.[0] as any)?.function?.arguments ?? '{}') as Record<string, number[]>;
    return titles.map((title, idx) => ({ id: title.id, title: title.title, recommended_posts: recommendations[`title_${idx + 1}`] ?? [] }));
  } catch (error) {
    return `An error occurred: ${error instanceof Error ? error.message : String(error)}`;
  }
}

void getAnthropicClient;
