import { getAnthropicClient, getOpenAIClient, MODELS } from '../clients';

type ProductTitle = { title: string };

function generateRecommendationParameters(productAmount: number, includeMotivation: boolean) {
  const properties = Object.fromEntries(
    Array.from({ length: productAmount }, (_, idx) => {
      const key = `recommendation_${idx + 1}`;
      return [
        key,
        {
          type: 'object',
          properties: {
            index: { type: 'integer' },
            order: { type: 'integer' },
            ...(includeMotivation ? { motivation: { type: 'string' } } : {}),
          },
          required: includeMotivation ? ['index', 'order', 'motivation'] : ['index', 'order'],
        },
      ];
    }),
  );

  return {
    type: 'object',
    properties,
    required: Object.keys(properties),
  };
}

export async function populateRecommendations(
  blogPostTitle: string,
  productTitles: ProductTitle[],
  productsListTitle: string,
  productsListDescription: string,
  productAmount: number,
  includeMotivation = true,
) {
  try {
    let systemMessage = "You are an AI that helps select the best products for a blog post's recommended products section based on the given themes.";
    if (includeMotivation) {
      systemMessage += ' Also provide funny, SEO-friendly motivations around 60 words with <strong> tags.';
    }

    const messages = [
      { role: 'system' as const, content: systemMessage },
      {
        role: 'user' as const,
        content: `Blog post title: ${blogPostTitle}\nProduct list title: ${productsListTitle}\nProduct list description: ${productsListDescription}\nProduct titles: ${JSON.stringify(productTitles)}\n`,
      },
    ];

    const functionParameters = generateRecommendationParameters(productAmount, includeMotivation);

    const response = await getOpenAIClient().chat.completions.create({
      model: MODELS.OPENAI_DEFAULT,
      messages,
      functions: [{ name: 'generate_product_recommendations', description: 'Generates product recommendations based on the given themes.', parameters: functionParameters }],
      function_call: { name: 'generate_product_recommendations' },
    });

    const recommendations = JSON.parse(response.choices[0]?.message.function_call?.arguments ?? '{}') as Record<string, { index: number; order: number; motivation?: string }>;

    if (includeMotivation) {
      const recommendedProducts = Array.from({ length: productAmount }, (_, idx) => {
        const rec = recommendations[`recommendation_${idx + 1}`];
        return {
          index: rec.index,
          order: rec.order,
          motivation: rec.motivation,
          title: productTitles[rec.index]?.title,
        };
      });

      const unique = new Map<string, (typeof recommendedProducts)[number]>();
      for (const rec of recommendedProducts) {
        if (rec.title) unique.set(rec.title, rec);
      }
      return Array.from(unique.values());
    }

    const recommendedIndices = Array.from({ length: productAmount }, (_, idx) => recommendations[`recommendation_${idx + 1}`]?.index ?? -1);
    return recommendedIndices.filter((i) => i >= 0).map((i) => productTitles[i]?.title);
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

void getAnthropicClient;
