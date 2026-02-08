import { getOpenAIClient, MODELS } from '@/server/ai/clients';
import { parseToolArguments } from '@/server/ai/utils';

export async function generateSingleTitle(
  businessType: string,
  existingTitles?: string[],
  language = 'en',
): Promise<{ title_text: string; seo_title: string; focus_keyword: string }> {
  let systemMessage =
    "You are an article title generator. You are responsible for creating catchy, SEO-friendly, and grammatically correct blog titles based on the given industry and number of titles requested by the user. The titles should not be subjective posts but should be posts that could be generated with AI. Ensure the SEO title and focus keyword match Yoast's guidelines. And do NOT make them to cliche and generic, make them actually interesting.";

  if (existingTitles?.length) {
    const existingTitlesMessage =
      'This is the titles already generated so DO NOT generate these again: ' + existingTitles.join(', ');
    systemMessage += ` ${existingTitlesMessage}`;
  }

  const response = await getOpenAIClient().chat.completions.create({
    model: MODELS.OPENAI_DEFAULT,
    messages: [
      { role: 'system', content: systemMessage },
      {
        role: 'user',
        content: `Generate 1 blog title for the industry: ${businessType}. Write the title in ${language} and make sure that the title is grammatically correct, professional sounding, and SEO-friendly.`,
      },
    ],
    tools: [
      {
        type: 'function',
        function: {
          name: 'generate_blog_titles',
          description: 'Generates blog title based on the given industry.',
          parameters: {
            type: 'object',
            properties: {
              title_1: {
                type: 'object',
                properties: {
                  title_text: { type: 'string', description: 'Title text 1' },
                  seo_title: { type: 'string', description: 'SEO title 1 (must follow Yoast guidelines)' },
                  focus_keyword: { type: 'string', description: 'Focus keyword 1 (must follow Yoast guidelines)' },
                },
                required: ['title_text', 'seo_title', 'focus_keyword'],
              },
            },
            required: ['title_1'],
          },
        },
      },
    ],
    tool_choice: { type: 'function', function: { name: 'generate_blog_titles' } },
  });

  const titleData = JSON.parse(parseToolArguments(response)) as {
    title_1: { title_text: string; seo_title: string; focus_keyword: string };
  };
  return titleData.title_1;
}
