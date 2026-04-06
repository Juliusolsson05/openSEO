import { MODELS } from '@/server/ai/clients';
import { generateElementFunctionParameters } from '@/server/ai/blog-elements/generate-function-parameters';
import { fetchLogoUrl } from '@/server/ai/blog-elements/fetch-logo-url';
import { uploadFromUrl } from '@/server/storage/upload';
import { callModel } from '@/server/ai/providers';

export async function generateNewElement(
  elementType: string,
  blogTitle: string,
  blogExcerpt: string,
  generationNote: string,
  elementsAbove: unknown,
  elementsBelow: unknown,
  companyId?: number,
): Promise<Record<string, unknown>> {
  const schema = generateElementFunctionParameters(elementType);

  const { json } = await callModel<any>({
    model: MODELS.OPENAI_DEFAULT,
    system: `You are a senior content writer generating a new '${elementType}' element for a blog post. Write content that is specific and valuable — not generic filler.

Rules:
- The content must include at least one specific example: a named company, tool, statistic, or real-world outcome.
- Do not write abstract corporate prose. Be concrete and actionable.
- Use <br><br> for line breaks, <strong> for key concepts, <em> for emphasis.
- The generation note from the user is the primary instruction — follow it exactly.
- Generate only the requested element type. Do not add extra elements.`,
    messages: [
      {
        role: 'user',
        content: `Blog title: ${blogTitle}
Blog excerpt: ${blogExcerpt}

Generation note (follow this exactly): ${generationNote}`,
      },
      {
        role: 'user',
        content: `Context — surrounding elements for continuity:
Elements above: ${JSON.stringify(elementsAbove, null, 2)}
Elements below: ${JSON.stringify(elementsBelow, null, 2)}

Generate a '${elementType}' element that fits naturally between these.`,
      },
    ],
    jsonSchema: {
      name: 'generate_new_element',
      schema,
    },
  });

  if (!json) throw new Error('generate-new-element: no JSON returned');
  let generatedElement = json;
  if (generatedElement.block?.content) generatedElement = generatedElement.block.content;

  if (elementType === 'tool_recommendation') {
    const companyUrl = generatedElement.companyUrl;
    if (companyUrl) {
      const logoUrl = await fetchLogoUrl(companyUrl);
      if (logoUrl) {
        const uploadedUrl = await uploadFromUrl(logoUrl, companyId ?? 0, 'logos');
        if (uploadedUrl) generatedElement.companyLogo = uploadedUrl;
      }
    }
  }

  return generatedElement;
}
