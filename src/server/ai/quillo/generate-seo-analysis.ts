import { MODELS } from '../clients';
import { callModel } from '../providers';

export async function generateSeoAnalysis(analyticsData: unknown) {
  const analyticsJson = JSON.stringify(analyticsData);

  try {
    const { json } = await callModel<Record<string, unknown>>({
      model: MODELS.OPENAI_DEFAULT,
      system:
        "You are responsible for analyzing a company's SEO profile. You should provide clear and understandable English explanations about the company's SEO performance and recommend focus keywords.",
      messages: [{ role: 'user', content: analyticsJson }],
      temperature: 1,
      jsonSchema: {
        name: 'seo_profile_analysis',
        strict: false,
        schema: {
          type: 'object',
          properties: {
            content_volume_and_publish_rate: { type: 'object', properties: { analysis: { type: 'string' } }, required: ['analysis'] },
            content_depth: { type: 'object', properties: { analysis: { type: 'string' } }, required: ['analysis'] },
            keyword_strategy: { type: 'object', properties: { analysis: { type: 'string' } }, required: ['analysis'] },
            link_strategy: { type: 'object', properties: { analysis: { type: 'string' } }, required: ['analysis'] },
            focus_keywords: {
              type: 'object',
              properties: {
                current_focus_keywords: { type: 'object', additionalProperties: { type: 'array', items: { type: 'string' } } },
                suggested_focus_keywords: { type: 'array', items: { type: 'string' } },
                gaps_and_recommendations: {
                  type: 'array',
                  items: { type: 'object', properties: { title: { type: 'string' }, description: { type: 'string' } }, required: ['title', 'description'] },
                },
              },
              required: ['current_focus_keywords', 'suggested_focus_keywords', 'gaps_and_recommendations'],
            },
            overall_recommendation: { type: 'string' },
          },
          required: ['content_volume_and_publish_rate', 'content_depth', 'keyword_strategy', 'link_strategy', 'focus_keywords', 'overall_recommendation'],
          additionalProperties: false,
        },
      },
    });

    return json ?? {};
  } catch (jsonError) {
    return {
      error: 'Failed to parse API response',
      details: jsonError instanceof Error ? jsonError.message : String(jsonError),
    };
  }
}
