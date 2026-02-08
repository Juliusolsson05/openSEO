import { getOpenAIClient } from '@/server/ai/clients';
import { parseToolArguments } from '@/server/ai/utils';

export async function generateTitles(
  industry: string,
  numTitles: number,
  language: string,
  existingTitles?: string[],
): Promise<Record<string, unknown>> {
  let systemMessage =
    "You are an article title generator. You are responsible for creating catchy, SEO-friendly, and grammatically correct blog titles based on the given industry and number of titles requested by the user. The titles should not be subjective posts but should be posts that could be generated with AI. Ensure the SEO title and focus keyword match Yoast's guidelines. And do NOT make them to cliche and generic, make them actually interesting.";

  if (existingTitles?.length) {
    const existingTitlesMessage =
      'This is the titles already generated so DO NOT generate these again: ' + existingTitles.join(', ');
    systemMessage += ` ${existingTitlesMessage}`;
  }

  const functionParameters = {
    type: 'object',
    properties: Object.fromEntries(
      Array.from({ length: numTitles }, (_, i) => {
        const n = i + 1;
        return [
          `title_${n}`,
          {
            type: 'object',
            properties: {
              title_text: { type: 'string', description: `Title text ${n}` },
              seo_title: { type: 'string', description: `SEO title ${n} (must follow Yoast guidelines)` },
              focus_keyword: { type: 'string', description: `Focus keyword ${n} (must follow Yoast guidelines)` },
            },
            required: ['title_text', 'seo_title', 'focus_keyword'],
          },
        ];
      }),
    ),
    required: Array.from({ length: numTitles }, (_, i) => `title_${i + 1}`),
  };

  const response = await getOpenAIClient().chat.completions.create({
    model: 'gpt-5-mini',
    messages: [
      { role: 'system', content: systemMessage },
      {
        role: 'user',
        content: `Generate ${numTitles} blog titles for the industry: ${industry}. Write the titles in ${language} and make sure that the titles are grammatically correct, professional sounding, and SEO-friendly.`,
      },
    ],
    tools: [
      {
        type: 'function',
        function: {
          name: 'generate_blog_titles',
          description: 'Generates blog titles based on the given industry and number of titles.',
          parameters: functionParameters,
        },
      },
    ],
    tool_choice: { type: 'function', function: { name: 'generate_blog_titles' } },
  });

  return JSON.parse(parseToolArguments(response));
}
