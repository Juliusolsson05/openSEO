import { MODELS } from '@/server/ai/clients';
import { callModel } from '@/server/ai/providers';

export async function generateSingleTitle(
  businessType: string,
  existingTitles?: string[],
  language = 'en',
): Promise<{ title_text: string; seo_title: string; focus_keyword: string }> {
  let systemMessage = `You are a blog title strategist. Create blog titles that make readers genuinely curious — titles that promise a specific insight, a surprising angle, or a practical takeaway.

Rules for good titles:
- Be specific, not vague. "How 3 SaaS Companies Cut Churn by 40% With One Onboarding Change" beats "How to Reduce Customer Churn in SaaS."
- Promise value the reader can act on. Every title should imply the reader will learn something concrete.
- Avoid generic clickbait patterns like "The Ultimate Guide to..." or "Everything You Need to Know About..."
- Use numbers, specific outcomes, or contrarian angles when they fit naturally.
- Titles should work for an audience that already understands the basics of ${businessType} — do not write beginner-level titles unless asked.
- Ensure the SEO title and focus keyword follow Yoast's guidelines.
- Write the title in ${language}.`;

  if (existingTitles?.length) {
    systemMessage += '\n\nThese titles already exist — do NOT generate duplicates or near-duplicates:\n' + existingTitles.map((t, i) => `${i + 1}. ${t}`).join('\n');
  }

  const { json } = await callModel<{
    title_1: { title_text: string; seo_title: string; focus_keyword: string };
  }>({
    model: MODELS.OPENAI_DEFAULT,
    system: systemMessage,
    messages: [
      {
        role: 'user',
        content: `Generate 1 blog title for the industry: ${businessType}.`,
      },
    ],
    jsonSchema: {
      name: 'generate_blog_title',
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
  });

  if (!json) throw new Error('generate-single-title: no JSON returned from model');
  return json.title_1;
}
