import { getOpenAIClient, MODELS } from '@/server/ai/clients';
import { generateElementFunctionParameters } from '@/server/ai/blog-elements/generate-function-parameters';
import { fetchLogoUrl } from '@/server/ai/blog-elements/fetch-logo-url';
import { uploadToCloudinary } from '@/server/ai/blog-elements/upload-to-cloudinary';
import { parseJsonResponse } from '@/server/ai/utils';

export async function generateNewElement(
  elementType: string,
  blogTitle: string,
  blogExcerpt: string,
  generationNote: string,
  elementsAbove: unknown,
  elementsBelow: unknown,
): Promise<Record<string, unknown>> {
  const schema = generateElementFunctionParameters(elementType);

  const response = await getOpenAIClient().chat.completions.create({
    model: MODELS.OPENAI_DEFAULT,
    messages: [
      {
        role: 'system',
        content: `You are a senior content writer generating a new '${elementType}' element for a blog post. Write content that is specific and valuable — not generic filler.

Rules:
- The content must include at least one specific example: a named company, tool, statistic, or real-world outcome.
- Do not write abstract corporate prose. Be concrete and actionable.
- Use <br><br> for line breaks, <strong> for key concepts, <em> for emphasis.
- The generation note from the user is the primary instruction — follow it exactly.
- Generate only the requested element type. Do not add extra elements.`,
      },
      {
        role: 'user',
        content: `Blog title: ${blogTitle}
Blog excerpt: ${blogExcerpt}

Generation note (follow this exactly): ${generationNote}`,
      },
      {
        role: 'system',
        content: `Context — surrounding elements for continuity:
Elements above: ${JSON.stringify(elementsAbove, null, 2)}
Elements below: ${JSON.stringify(elementsBelow, null, 2)}

Generate a '${elementType}' element that fits naturally between these.`,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'generate_new_element',
        strict: true,
        schema,
      },
    },
    max_completion_tokens: 4000,
  });

  let generatedElement = parseJsonResponse<any>(response);
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
