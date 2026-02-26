import { getAnthropicClient, getOpenAIClient, MODELS } from '../clients';

export async function generateSeoAnalysis(analyticsData: unknown) {
  const analyticsJson = JSON.stringify(analyticsData);
  const messages = [
    {
      role: 'system' as const,
      content: "You are responsible for analyzing a company's SEO profile. You should provide clear and understandable English explanations about the company's SEO performance and recommend focus keywords.",
    },
    { role: 'user' as const, content: analyticsJson },
  ];

  const response = await getOpenAIClient().chat.completions.create({
    model: MODELS.OPENAI_DEFAULT,
    messages,
    temperature: 1,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    response_format: {
      type: 'json_schema',
      json_schema: {
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
    },
  });

  try {
    return JSON.parse(response.choices[0]?.message.content ?? '{}');
  } catch (jsonError) {
    const content = response.choices[0]?.message.content ?? '';
    return {
      error: 'Failed to parse API response',
      details: jsonError instanceof Error ? jsonError.message : String(jsonError),
      raw_content: content.slice(0, 1000),
    };
  }
}

void getAnthropicClient;
