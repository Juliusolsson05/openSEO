import { MODELS } from '../clients';
import { callModel } from '../providers';

import type { ProductTitle } from './generate-motivations';

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

    const recProperties: Record<string, any> = {};
    const requiredKeys: string[] = [];

    for (let i = 0; i < productAmount; i++) {
      const key = `recommendation_${i + 1}`;
      const props: Record<string, any> = {
        index: { type: 'integer' },
        order: { type: 'integer' },
      };
      const req = ['index', 'order'];
      if (includeMotivation) {
        props.motivation = { type: 'string' };
        req.push('motivation');
      }
      recProperties[key] = {
        type: 'object',
        properties: props,
        required: req,
        additionalProperties: false,
      };
      requiredKeys.push(key);
    }

    const { json: recommendations } = await callModel<
      Record<string, { index: number; order: number; motivation?: string }>
    >({
      model: MODELS.OPENAI_DEFAULT,
      system: systemMessage,
      messages: [
        {
          role: 'user',
          content: `Blog post title: ${blogPostTitle}\nProduct list title: ${productsListTitle}\nProduct list description: ${productsListDescription}\nProduct titles: ${JSON.stringify(productTitles)}\n`,
        },
      ],
      jsonSchema: {
        name: 'generate_product_recommendations',
        schema: {
          type: 'object',
          properties: recProperties,
          required: requiredKeys,
          additionalProperties: false,
        },
      },
    });

    if (!recommendations) throw new Error('populate-recommendations: no JSON returned');

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
