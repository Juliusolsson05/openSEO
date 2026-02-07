import { getOpenAIClient } from '@/server/ai/clients';
import { generateElementFunctionParameters } from '@/server/ai/blog-elements/generate-function-parameters';
import { fetchLogoUrl } from '@/server/ai/blog-elements/fetch-logo-url';
import { uploadToCloudinary } from '@/server/ai/blog-elements/upload-to-cloudinary';
import { parseToolArguments } from '@/server/ai/utils';

export async function generateNewElement(
  elementType: string,
  blogTitle: string,
  blogExcerpt: string,
  generationNote: string,
  elementsAbove: unknown,
  elementsBelow: unknown,
): Promise<Record<string, unknown>> {
  const functionParameters = generateElementFunctionParameters(elementType);

  const response = await getOpenAIClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          `You are responsible for generating a new blog post element of type '${elementType}' based on the given note and context. Ensure the content fits seamlessly within the blog post while following best SEO practices. The generated content should maintain the exact structure as defined in the function parameters.` +
          'The generation note is what the user writes, YOU MUST FUCKING follow this , DO NOT add another element, WHAT THE USER WRITES IS WHAT IS IMPORTANT.',
      },
      { role: 'user', content: `Title: ${blogTitle}\nExcerpt: ${blogExcerpt}\nGeneration Note: ${generationNote}` },
      {
        role: 'system',
        content:
          `Blog Post Structure:\nElements Above:\n${JSON.stringify(elementsAbove, null, 2)}\nElements Below:\n${JSON.stringify(elementsBelow, null, 2)}\nNow generate a new '${elementType}' element that fits well within this blog post structure.`,
      },
    ],
    tools: [
      {
        type: 'function',
        function: {
          name: 'generate_new_element',
          description: `Generates a new blog post element of type '${elementType}'.`,
          parameters: functionParameters,
        },
      },
    ],
    tool_choice: { type: 'function', function: { name: 'generate_new_element' } },
    max_tokens: 1000,
  });

  let generatedElement = JSON.parse(parseToolArguments(response)) as any;
  if (generatedElement.block?.content) generatedElement = generatedElement.block.content;

  if (elementType === 'tool_recommendation') {
    const companyUrl = generatedElement.companyUrl;
    if (companyUrl) {
      const logoUrl = await fetchLogoUrl(companyUrl);
      if (logoUrl) {
        const cloudinaryUrl = await uploadToCloudinary(logoUrl);
        if (cloudinaryUrl) generatedElement.companyLogo = cloudinaryUrl;
      }
    }
  }

  return generatedElement;
}
