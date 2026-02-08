import { getOpenAIClient, MODELS } from '@/server/ai/clients';
import { generateBlogFunctionParameters } from '@/server/ai/blog-elements/generate-function-parameters';
import { parseToolArguments } from '@/server/ai/utils';

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

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    {
      role: 'system',
      content: `You are a blog post content generator. Generate the content for each block according to the given structure. Ensure the blog post is long and follows Yoast's SEO guidelines. Follow the requirments closly, here is a example on how to use br, em and strong tags correclty (this is just a generic example paragraph so ignore the subject): 'A balanced diet is essential for maintaining good health and well-being, providing the body with the necessary nutrients it needs to function properly. This includes a variety of foods such as fruits, vegetables, whole grains, lean proteins, and healthy fats. Each food group plays a vital role; for instance, fruits and vegetables are rich in <strong>vitamins and minerals</strong>, while proteins are crucial for <em>muscle repair and growth</em>.<br><br>
According to nutritionists, eating a diverse range of foods helps to ensure that you get all the essential nutrients your body requires. In addition, studies show that those who consistently follow a balanced diet are less likely to develop chronic diseases such as <strong>heart disease</strong>, <strong>diabetes</strong>, and <strong>obesity</strong>.<br><br>
Regular consumption of nutrient-dense foods not only supports physical health but also promotes <em>mental well-being</em>, emphasizing the importance of dietary choices in leading a healthy lifestyle.'

Also remember that the list blocks should never contain any products recommendations becuase we have a seperate block for that.

Do not hallucinate. Try to provide useful information to the reader and do NOT make it generic ans soul less.
            `,
    },
    { role: 'user', content: `Title: ${title}, Focus keyword: ${focusKeyword} (MOST IMPORTANT)` },
    {
      role: 'assistant',
      content:
        ' I understand that i should avoid cliche content that sounds AI generated, such as using words like "crucial" or terms like "to days digital age" I also understand that when referring to the company I should not write "Companies like ..." but I should talk about it in first person: "Our solutions...". The most important part is that we keep a language that is not full of cliche and AI words.". I should also write long, becuase longer content is better. It is also VERY important that I use a good mix of <br>, <em> and <strong> tags. I am in my next message going to write the blog post.',
    },
  ];

  if (businessAware) {
    messages.push({
      role: 'user',
      content: `This blog post should be non biast and should focus on providing quality information to the reader, we should not only plug our own product, but mentioning once and twice wont hurt. Think about how Hubspot still mentions competitors and focuses on writing quality content to the readers, but here is information about our business (our company is ${businessName}, so if you are refering to it do that in first person, e.g our product, our company): """${businessDescription}""" `,
    });
  }

  const functionParams = generateBlogFunctionParameters(JSON.stringify(structure));

  const response = await getOpenAIClient().chat.completions.create({
    model,
    messages,
    tools: [
      {
        type: 'function',
        function: {
          name: 'generate_blog_post',
          description: 'Generates a blog post based on the given structure.',
          parameters: functionParams,
        },
      },
    ],
    tool_choice: { type: 'function', function: { name: 'generate_blog_post' } },
  });

  const generatedContent = JSON.parse(parseToolArguments(response)) as { blocks: Record<string, unknown>[] | Record<string, unknown> };

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
