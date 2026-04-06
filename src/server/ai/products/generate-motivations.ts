import { MODELS } from '../clients';
import { callModel } from '../providers';

export type ProductTitle = { title: string };

export async function generateMotivations(
  blogPostTitle: string,
  productTitles: ProductTitle[],
  productsListTitle: string,
  productsListDescription: string,
) {
  try {
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

    const { json: motivations } = await callModel<
      Record<string, { index: number; motivation: string }>
    >({
      model: MODELS.OPENAI_DEFAULT,
      system: 'You are an AI that generates funny, SEO-friendly, engaging motivations for product titles.',
      messages: [
        {
          role: 'user',
          content: `Blog post title: ${blogPostTitle}\nProduct list title: ${productsListTitle}\nProduct list description: ${productsListDescription}\nProduct titles: ${JSON.stringify(productTitles)}\n`,
        },
      ],
      jsonSchema: {
        name: 'generate_motivations',
        schema: {
          type: 'object',
          properties: motivationProperties,
          required: requiredKeys,
          additionalProperties: false,
        },
      },
    });

    if (!motivations) throw new Error('generate-motivations: no JSON returned');
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
