import { getOpenAIClient, MODELS } from '@/server/ai/clients';
import { generateElementFunctionParameters } from '@/server/ai/blog-elements/generate-function-parameters';
import { parseToolArguments } from '@/server/ai/utils';

export async function enhanceReadability(
  elementType: string,
  elementStructure: unknown,
  blogTitle: string,
): Promise<Record<string, unknown>> {
  const functionParameters = generateElementFunctionParameters(elementType);

  const response = await getOpenAIClient().chat.completions.create({
    model: MODELS.OPENAI_DEFAULT,
    messages: [
      {
        role: 'system',
        content:
          "You are responsible for enhancing a blog post element to improve its readability. Add em, strong, and br tags to make the content easier to read. Ensure the enhanced content fits seamlessly within the blog post while following best SEO practices. The enhanced content should maintain the exact same structure as the original, without adding nested 'block' or 'content' keys." +
          'Here is a example of how we are doing it for Lorem Ipsum' +
          'This is before:' +
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.' +
          'And this is after:' +
          'Lorem ipsum dolor sit <strong>amet</strong>, consectetur <em>adipiscing elit</em>, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.<br><br> Ut enim ad <strong>minim veniam</strong>, quis nostrud <em>exercitation</em> ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.<br><br><strong>Excepteur sint</strong> occaecat cupidatat non proident, sunt in <em>culpa qui officia</em> deserunt mollit anim id est laborum. Sed ut <strong>perspiciatis</strong> unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo <em>inventore veritatis</em> et quasi architecto beatae vitae dicta sunt explicabo.<br><br><strong>Nemo enim</strong> ipsam voluptatem quia voluptas sit <em>aspernatur aut odit</em> aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui <strong>dolorem ipsum</strong> quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore <em>magnam aliquam</em> quaerat voluptatem.',
      },
      { role: 'user', content: `Title: ${blogTitle}\nElement Structure: ${JSON.stringify(elementStructure, null, 4)}` },
      {
        role: 'system',
        content:
          'Now enhance the content by adding em, strong, and br tags to improve readability. Maintain the exact same keys as the original structure.',
      },
    ],
    tools: [
      {
        type: 'function',
        function: {
          name: 'enhance_blog_element_readability',
          description: "Enhances a blog post element's readability by adding em, strong, and br tags.",
          parameters: functionParameters,
        },
      },
    ],
    tool_choice: { type: 'function', function: { name: 'enhance_blog_element_readability' } },
    max_tokens: 500,
  });

  let enhanced = JSON.parse(parseToolArguments(response)) as any;
  if (enhanced.block?.content) enhanced = enhanced.block.content;
  return enhanced;
}
