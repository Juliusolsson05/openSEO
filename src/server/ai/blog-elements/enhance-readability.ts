import { MODELS } from '@/server/ai/clients';
import { generateElementFunctionParameters } from '@/server/ai/blog-elements/generate-function-parameters';
import { callModel } from '@/server/ai/providers';

export async function enhanceReadability(
  elementType: string,
  elementStructure: unknown,
  blogTitle: string,
): Promise<Record<string, unknown>> {
  const schema = generateElementFunctionParameters(elementType);

  const { json } = await callModel<any>({
    model: MODELS.OPENAI_DEFAULT,
    system: `You are a content editor improving the readability of a blog post element. Your job is to add HTML formatting tags to make the content easier to scan and read.

What to do:
- Add <strong> around key concepts and important terms (2-3 per text block).
- Add <em> around words that deserve emphasis or nuance (1-2 per text block).
- Add <br><br> between distinct ideas to break up walls of text.
- Do NOT change the actual words or meaning — only add formatting tags.
- Do NOT add markdown formatting (no ** or *) — only HTML tags.
- Maintain the exact same JSON structure as the original.

Example of what good formatting looks like:

Before: "Customer retention is often more cost-effective than acquisition. Companies that invest in onboarding see higher lifetime value. Slack reduced churn by 25% after redesigning their first-week experience, focusing on getting teams to send 2000 messages."

After: "Customer retention is often more cost-effective than acquisition. Companies that invest in onboarding see higher <strong>lifetime value</strong>.<br><br>Slack reduced churn by <strong>25%</strong> after redesigning their first-week experience, focusing on getting teams to send <em>2,000 messages</em> — a threshold they found correlated with long-term retention."`,
    messages: [
      { role: 'user', content: `Blog title: ${blogTitle}\nElement to enhance:\n${JSON.stringify(elementStructure, null, 4)}` },
    ],
    jsonSchema: {
      name: 'enhance_blog_element_readability',
      schema,
    },
  });

  if (!json) throw new Error('enhance-readability: no JSON returned');
  let enhanced = json;
  if (enhanced.block?.content) enhanced = enhanced.block.content;
  return enhanced;
}
