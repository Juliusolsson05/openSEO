import { getOpenAIClient, MODELS } from '@/server/ai/clients';
import { parseJsonResponse } from '@/server/ai/utils';

export async function generateTitles(
  industry: string,
  numTitles: number,
  language: string,
  existingTitles?: string[],
): Promise<Record<string, unknown>> {
  let systemMessage =
    "You are an article title generator. You are responsible for creating catchy, SEO-friendly, and grammatically correct blog titles based on the given industry and number of titles requested by the user. The titles should be objective and informative. Ensure the SEO title and focus keyword match Yoast's guidelines. Do NOT make them too cliché and generic — make them actually interesting.";

  if (existingTitles?.length) {
    systemMessage += '\n\nThese titles already exist — do NOT generate duplicates:\n' + existingTitles.map((t, i) => `${i + 1}. ${t}`).join('\n');
  }

  const titleProperties: Record<string, any> = {};
  const requiredKeys: string[] = [];

  for (let i = 1; i <= numTitles; i++) {
    const key = `title_${i}`;
    titleProperties[key] = {
      type: 'object',
      properties: {
        title_text: { type: 'string', description: `Title text ${i}` },
        seo_title: { type: 'string', description: `SEO title ${i} (must follow Yoast guidelines)` },
        focus_keyword: { type: 'string', description: `Focus keyword ${i} (must follow Yoast guidelines)` },
      },
      required: ['title_text', 'seo_title', 'focus_keyword'],
      additionalProperties: false,
    };
    requiredKeys.push(key);
  }

  const response = await getOpenAIClient().chat.completions.create({
    model: MODELS.OPENAI_DEFAULT,
    messages: [
      { role: 'system', content: systemMessage },
      {
        role: 'user',
        content: `Generate ${numTitles} blog titles for the industry: ${industry}. Write the titles in ${language}.`,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'generate_blog_titles',
        strict: true,
        schema: {
          type: 'object',
          properties: titleProperties,
          required: requiredKeys,
          additionalProperties: false,
        },
      },
    },
  });

  return parseJsonResponse(response);
}
