import { getOpenAIClient, MODELS } from '@/server/ai/clients';
import { parseJsonResponse } from '@/server/ai/utils';

export async function generateTitles(
  industry: string,
  numTitles: number,
  language: string,
  existingTitles?: string[],
): Promise<Record<string, unknown>> {
  let systemMessage = `You are a blog title strategist. Create blog titles that make readers genuinely curious — titles that promise a specific insight, a surprising angle, or a practical takeaway.

Rules for good titles:
- Be specific, not vague. "How 3 SaaS Companies Cut Churn by 40% With One Onboarding Change" beats "How to Reduce Customer Churn in SaaS."
- Promise value the reader can act on. Every title should imply the reader will learn something concrete.
- Avoid generic clickbait patterns like "The Ultimate Guide to..." or "Everything You Need to Know About..."
- Use numbers, specific outcomes, or contrarian angles when they fit naturally.
- Titles should work for an audience that already understands the basics of ${industry} — do not write beginner-level titles unless asked.
- Ensure the SEO title and focus keyword follow Yoast's guidelines.
- Write all titles in ${language}.`;

  if (existingTitles?.length) {
    systemMessage += '\n\nThese titles already exist — do NOT generate duplicates or near-duplicates:\n' + existingTitles.map((t, i) => `${i + 1}. ${t}`).join('\n');
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
        content: `Generate ${numTitles} blog titles for the industry: ${industry}.`,
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
