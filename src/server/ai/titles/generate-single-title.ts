import { getOpenAIClient, MODELS } from '@/server/ai/clients';
import { parseJsonResponse } from '@/server/ai/utils';

export async function generateSingleTitle(
  businessType: string,
  existingTitles?: string[],
  language = 'en',
): Promise<{ title_text: string; seo_title: string; focus_keyword: string }> {
  let systemMessage =
    "You are an article title generator. You are responsible for creating catchy, SEO-friendly, and grammatically correct blog titles based on the given industry and number of titles requested by the user. The titles should be objective and informative. Ensure the SEO title and focus keyword match Yoast's guidelines. Do NOT make them too cliché and generic — make them actually interesting.";

  if (existingTitles?.length) {
    systemMessage += '\n\nThese titles already exist — do NOT generate duplicates:\n' + existingTitles.map((t, i) => `${i + 1}. ${t}`).join('\n');
  }

  const response = await getOpenAIClient().chat.completions.create({
    model: MODELS.OPENAI_DEFAULT,
    messages: [
      { role: 'system', content: systemMessage },
      {
        role: 'user',
        content: `Generate 1 blog title for the industry: ${businessType}. Write the title in ${language}.`,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'generate_blog_title',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            title_1: {
              type: 'object',
              properties: {
                title_text: { type: 'string', description: 'Title text' },
                seo_title: { type: 'string', description: 'SEO title (must follow Yoast guidelines)' },
                focus_keyword: { type: 'string', description: 'Focus keyword (must follow Yoast guidelines)' },
              },
              required: ['title_text', 'seo_title', 'focus_keyword'],
              additionalProperties: false,
            },
          },
          required: ['title_1'],
          additionalProperties: false,
        },
      },
    },
  });

  const titleData = parseJsonResponse<{ title_1: { title_text: string; seo_title: string; focus_keyword: string } }>(response);
  return titleData.title_1;
}
