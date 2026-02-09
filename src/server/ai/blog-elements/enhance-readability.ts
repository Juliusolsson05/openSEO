import { getOpenAIClient, MODELS } from '@/server/ai/clients';
import { generateElementFunctionParameters } from '@/server/ai/blog-elements/generate-function-parameters';
import { parseJsonResponse } from '@/server/ai/utils';

export async function enhanceReadability(
  elementType: string,
  elementStructure: unknown,
  blogTitle: string,
): Promise<Record<string, unknown>> {
  const schema = generateElementFunctionParameters(elementType);

  const response = await getOpenAIClient().chat.completions.create({
    model: MODELS.OPENAI_DEFAULT,
    messages: [
      {
        role: 'system',
        content:
          "You are responsible for enhancing a blog post element to improve its readability. Add em, strong, and br tags to make the content easier to read. Ensure the enhanced content fits seamlessly within the blog post while following best SEO practices. The enhanced content should maintain the exact same structure as the original, without adding nested 'block' or 'content' keys." +
          '\n\nHere is a before and after example:\n' +
          'Before:\n' +
          "'A balanced diet is essential for maintaining good health and well-being, providing the body with the necessary nutrients it needs to function properly. This includes a variety of foods such as fruits, vegetables, whole grains, lean proteins, and healthy fats. Each food group plays a vital role for instance fruits and vegetables are rich in vitamins and minerals, while proteins are important for muscle repair and growth. Regular consumption of nutrient-dense foods not only supports physical health but also promotes mental well-being, emphasizing the importance of dietary choices in leading a healthy lifestyle.'" +
          '\n\nAfter:\n' +
          "'A balanced diet is essential for maintaining good health and well-being, providing the body with the necessary nutrients it needs to function properly. This includes a variety of foods such as fruits, vegetables, whole grains, lean proteins, and healthy fats.<br><br>Each food group plays a vital role; for instance, fruits and vegetables are rich in <strong>vitamins and minerals</strong>, while proteins are important for <em>muscle repair and growth</em>.<br><br>Regular consumption of nutrient-dense foods not only supports physical health but also promotes <em>mental well-being</em>, emphasizing the importance of dietary choices in leading a healthy lifestyle.'",
      },
      { role: 'user', content: `Title: ${blogTitle}\nElement Structure: ${JSON.stringify(elementStructure, null, 4)}` },
      {
        role: 'system',
        content:
          'Now enhance the content by adding em, strong, and br tags to improve readability. Maintain the exact same keys as the original structure.',
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'enhance_blog_element_readability',
        strict: true,
        schema,
      },
    },
    max_completion_tokens: 2000,
  });

  let enhanced = parseJsonResponse<any>(response);
  if (enhanced.block?.content) enhanced = enhanced.block.content;
  return enhanced;
}
