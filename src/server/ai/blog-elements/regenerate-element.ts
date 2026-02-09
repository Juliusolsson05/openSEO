import { getOpenAIClient, MODELS } from '@/server/ai/clients';
import { generateElementFunctionParameters } from '@/server/ai/blog-elements/generate-function-parameters';
import { fetchLogoUrl } from '@/server/ai/blog-elements/fetch-logo-url';
import { uploadToCloudinary } from '@/server/ai/blog-elements/upload-to-cloudinary';
import { parseJsonResponse } from '@/server/ai/utils';

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
  const schema = generateElementFunctionParameters(targetType, targetCount);

  const response = await getOpenAIClient().chat.completions.create({
    model: MODELS.OPENAI_DEFAULT,
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
        content: `Title: ${blogTitle}\nExcerpt: ${blogExcerpt}\n\nRegeneration Note (primary instruction — follow this above all else): '${regenerationNote}'`,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'regenerate_blog_element',
        strict: true,
        schema,
      },
    },
    max_completion_tokens: 16000,
  });

  let regeneratedElements = parseJsonResponse<any>(response);

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
