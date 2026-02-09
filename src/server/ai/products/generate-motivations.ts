import { getAnthropicClient, getOpenAIClient, MODELS } from '../clients';

type ProductTitle = { title: string };

export async function generateMotivations(
  blogPostTitle: string,
  productTitles: ProductTitle[],
  productsListTitle: string,
  productsListDescription: string,
) {
  try {
    const messages = [
      { role: 'system' as const, content: 'You are an AI that generates funny, SEO-friendly, engaging motivations for product titles.' },
      {
        role: 'user' as const,
        content: `Blog post title: ${blogPostTitle}\nProduct list title: ${productsListTitle}\nProduct list description: ${productsListDescription}\nProduct titles: ${JSON.stringify(productTitles)}\n`,
      },
    ];

    const functionParameters = {
      type: 'object',
      properties: Object.fromEntries(
        Array.from({ length: productTitles.length }, (_, idx) => [
          `motivation_${idx + 1}`,
          {
            type: 'object',
            properties: { index: { type: 'integer' }, motivation: { type: 'string' } },
            required: ['index', 'motivation'],
          },
        ]),
      ),
      required: Array.from({ length: productTitles.length }, (_, idx) => `motivation_${idx + 1}`),
    };

    const response = await getOpenAIClient().chat.completions.create({
      model: MODELS.OPENAI_DEFAULT,
      messages,
      tools: [{
        type: 'function' as const,
        function: { name: 'generate_motivations', description: 'Generates motivations for the given product titles.', parameters: functionParameters },
      }],
      tool_choice: { type: 'function' as const, function: { name: 'generate_motivations' } },
    });

    const motivations = JSON.parse(response.choices[0]?.message?.tool_calls?.[0]?.function?.arguments ?? '{}') as Record<string, { index: number; motivation: string }>;
    return Array.from({ length: Object.keys(motivations).length }, (_, idx) => {
      const m = motivations[`motivation_${idx + 1}`];
      return {
        index: m.index,
        motivation: m.motivation,
        title: productTitles[m.index]?.title,
      };
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

void getAnthropicClient;
