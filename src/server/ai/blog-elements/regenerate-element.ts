import { getOpenAIClient } from '@/server/ai/clients';
import { generateElementFunctionParameters } from '@/server/ai/blog-elements/generate-function-parameters';
import { fetchLogoUrl } from '@/server/ai/blog-elements/fetch-logo-url';
import { uploadToCloudinary } from '@/server/ai/blog-elements/upload-to-cloudinary';
import { parseToolArguments } from '@/server/ai/utils';

export async function regenerateElement(
  elementType: string,
  elementStructure: unknown,
  blogTitle: string,
  blogExcerpt: string,
  regenerationNote: string,
  aboveElement: unknown = null,
  belowElement: unknown = null,
  newElementType: string | null = null,
  newElementCount = 1,
): Promise<unknown> {
  const targetType = newElementType || elementType;
  const targetCount = newElementType ? newElementCount : 1;
  const functionParameters = generateElementFunctionParameters(targetType, targetCount);

  const response = await getOpenAIClient().chat.completions.create({
    model: 'gpt-5-mini',
    messages: [
      {
        role: 'system',
        content: `You are responsible for regenerating a blog post element of type '${elementType}' into ${targetCount} element(s) of type '${targetType}' based on the given note and context. Ensure the content fits seamlessly within the blog post while following best SEO practices. Do not hallucinate.`,
      },
      {
        role: 'system',
        content: `Old Element Structure: ${JSON.stringify(elementStructure, null, 4)}\nAbove Element: ${aboveElement ? JSON.stringify(aboveElement, null, 4) : 'None'}\nBelow Element: ${belowElement ? JSON.stringify(belowElement, null, 4) : 'None'}\nNow regenerate the content according to the new structure for ${targetCount} element(s) of type '${targetType}'.`,
      },
      {
        role: 'user',
        content: `Title: ${blogTitle}\nExcerpt: ${blogExcerpt}\nRegeneration Note (THIS IS EXTREMELY IMPORTANT; THIS IS WHAT THE USER IS WRITING; THIS WEIGHS 3 TIMES AS MUCH AS ANY OTHER INPUT): '${regenerationNote}'`,
      },
    ],
    tools: [
      {
        type: 'function',
        function: {
          name: 'regenerate_blog_element',
          description: `Regenerates a blog post element into ${targetCount} element(s) of type '${targetType}'.`,
          parameters: functionParameters,
        },
      },
    ],
    tool_choice: { type: 'function', function: { name: 'regenerate_blog_element' } },
    max_tokens: 16000,
  });

  let regeneratedElements = JSON.parse(parseToolArguments(response)) as any;

  if (targetCount === 1) {
    if (regeneratedElements.block?.content) regeneratedElements = regeneratedElements.block.content;
  } else if (regeneratedElements.blocks) {
    regeneratedElements = regeneratedElements.blocks.map((block: any) => block.content);
  }

  if (targetType === 'case_study' || targetType === 'tool_recommendation') {
    const list = Array.isArray(regeneratedElements) ? regeneratedElements : [regeneratedElements];
    for (const element of list) {
      const companyUrl = element.companyWebsite || element.companyUrl;
      if (companyUrl) {
        const logoUrl = await fetchLogoUrl(companyUrl);
        if (logoUrl) {
          const cloudinaryUrl = await uploadToCloudinary(logoUrl);
          if (cloudinaryUrl) element.companyLogo = cloudinaryUrl;
        }
      }
    }
    if (targetCount === 1) regeneratedElements = list[0];
  }

  return regeneratedElements;
}
