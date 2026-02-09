import { getOpenAIClient, MODELS } from '@/server/ai/clients';
import { generateBlogFunctionParameters } from '@/server/ai/blog-elements/generate-function-parameters';
import { parseJsonResponse } from '@/server/ai/utils';

export async function generateBlogPost(
  seoTitle: string,
  focusKeyword: string,
  title: string,
  structure: Record<string, unknown>,
  model = MODELS.OPENAI_DEFAULT,
  businessAware = false,
  businessDescription?: string,
  businessName?: string,
): Promise<{ elements: Array<Record<string, unknown>>; usage: unknown; cost: Record<string, number> }> {
  if (businessAware && (!businessDescription || !businessName)) {
    throw new Error('business_description and business_name must be provided when business_aware is True');
  }

  const messages: Array<{ role: 'system' | 'user'; content: string }> = [
    {
      role: 'system',
      content: `You are a blog post content generator. Generate the content for each block according to the given structure. Ensure the blog post is long and follows Yoast's SEO guidelines. Follow the requirements closely.

Here is an example of how to use br, em and strong tags correctly (this is just a generic example paragraph so ignore the subject):

'A balanced diet is essential for maintaining good health and well-being, providing the body with the necessary nutrients it needs to function properly. This includes a variety of foods such as fruits, vegetables, whole grains, lean proteins, and healthy fats. Each food group plays a vital role; for instance, fruits and vegetables are rich in <strong>vitamins and minerals</strong>, while proteins are crucial for <em>muscle repair and growth</em>.<br><br>
According to nutritionists, eating a diverse range of foods helps to ensure that you get all the essential nutrients your body requires. In addition, studies show that those who consistently follow a balanced diet are less likely to develop chronic diseases such as <strong>heart disease</strong>, <strong>diabetes</strong>, and <strong>obesity</strong>.<br><br>
Regular consumption of nutrient-dense foods not only supports physical health but also promotes <em>mental well-being</em>, emphasizing the importance of dietary choices in leading a healthy lifestyle.'

Important rules:
- List blocks should never contain product recommendations because we have a separate block for that.
- Do not hallucinate. Provide useful information to the reader.
- Do NOT make it generic and soulless.
- Avoid cliché content that sounds AI-generated, such as using words like "crucial" or terms like "today's digital age."
- When referring to the company, do not write "Companies like ..." — talk about it in first person: "Our solutions..."
- Use a good mix of <br>, <em> and <strong> tags throughout.
- Write long — each paragraph block should be at least 165 words.`,
    },
    { role: 'user', content: `Title: ${title}, Focus keyword: ${focusKeyword} (MOST IMPORTANT)` },
  ];

  if (businessAware) {
    messages.push({
      role: 'user',
      content: `This blog post should be unbiased and should focus on providing quality information to the reader. We should not only plug our own product, but mentioning it once or twice is fine. Think about how HubSpot still mentions competitors and focuses on writing quality content to the readers. Here is information about our business (our company is ${businessName}, so if you are referring to it do that in first person, e.g. our product, our company): """${businessDescription}"""`,
    });
  }

  const schema = generateBlogFunctionParameters(JSON.stringify(structure));

  const response = await getOpenAIClient().chat.completions.create({
    model,
    messages,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'generate_blog_post',
        strict: true,
        schema,
      },
    },
  });

  const generatedContent = parseJsonResponse<{ blocks: Record<string, unknown>[] | Record<string, unknown> }>(response);

  const elements: Array<Record<string, unknown>> = [];
  if (Array.isArray(generatedContent.blocks)) {
    for (const block of generatedContent.blocks) {
      for (const [blockKey, blockValue] of Object.entries(block)) {
        const [elementType] = blockKey.split(/_(?=\d+$)/);
        elements.push({ type: elementType, content: blockValue });
      }
    }
  } else {
    for (const [blockKey, blockValue] of Object.entries(generatedContent.blocks)) {
      const [elementType] = blockKey.split(/_(?=\d+$)/);
      elements.push({ type: elementType, content: blockValue });
    }
  }

  const usage = response.usage ?? { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
  const inputTokens = usage.prompt_tokens ?? 0;
  const outputTokens = usage.completion_tokens ?? 0;
  const inputCost = (inputTokens / 1_000_000) * 0.15;
  const outputCost = (outputTokens / 1_000_000) * 0.6;

  return {
    elements,
    usage,
    cost: { inputCost, outputCost, totalCost: inputCost + outputCost },
  };
}
