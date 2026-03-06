import { getOpenAIClient, MODELS } from '../clients';
import { parseJsonResponse } from '../utils';

export type ProductTitle = { title: string };

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

    const motivationProperties: Record<string, any> = {};
    const requiredKeys: string[] = [];

    for (let i = 0; i < productTitles.length; i++) {
      const key = `motivation_${i + 1}`;
      motivationProperties[key] = {
        type: 'object',
        properties: {
          index: { type: 'integer' },
          motivation: { type: 'string' },
        },
        required: ['index', 'motivation'],
        additionalProperties: false,
      };
      requiredKeys.push(key);
    }

    const response = await (await getOpenAIClient()).chat.completions.create({
      model: MODELS.OPENAI_DEFAULT,
      messages,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'generate_motivations',
          strict: true,
          schema: {
            type: 'object',
            properties: motivationProperties,
            required: requiredKeys,
            additionalProperties: false,
          },
        },
      },
    });

    const motivations = parseJsonResponse<Record<string, { index: number; motivation: string }>>(response);
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
