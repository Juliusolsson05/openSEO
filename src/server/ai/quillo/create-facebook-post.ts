import { MODELS } from '../clients';
import { callModel } from '../providers';

export interface CreateFacebookPostContext {
  elements: string
  slug: string
  companyUrl?: string | null
}

function joinUrl(base: string, slug: string): string {
  const trimmedBase = base.replace(/\/+$/, '')
  const trimmedSlug = slug.replace(/^\/+/, '').replace(/\/+$/, '')
  return `${trimmedBase}/${trimmedSlug}`
}

// Strips trailing sentence punctuation from any URL in a blob of text.
// Matches http/https URLs and trims .,;:!? characters that got glued on.
export function stripTrailingUrlPunctuation(text: string): string {
  return text.replace(/(https?:\/\/[^\s)]+?)([.,;:!?]+)(?=\s|$|[)\]])/g, '$1')
}

export async function createFacebookPost(ctx: CreateFacebookPostContext) {
  const { elements, slug, companyUrl } = ctx

  try {
    const baseInstructions =
      'You turn blog posts and articles into Facebook posts. The post should be human sounding and NOT cliche. Use emojis and hashtags for emphasis, but no markdown or formatting like bold or italics. ' +
      'When inserting a URL, ensure no sentence-ending punctuation (. , ; : ! ?) is attached to the URL — always put a space between the URL and any following punctuation, or place the URL at the end of the sentence without a period.'

    const urlInstruction = companyUrl
      ? ` Include exactly one link to the post using this URL format (no trailing punctuation attached): ${joinUrl(companyUrl, slug)}`
      : ' Do not include any link in the post.'

    const { text } = await callModel({
      model: MODELS.OPENAI_DEFAULT,
      system: baseInstructions + urlInstruction,
      messages: [{ role: 'user', content: elements }],
      temperature: 1,
    });

    const raw = text;
    return stripTrailingUrlPunctuation(raw);
  } catch (error) {
    return `An error occurred: ${error instanceof Error ? error.message : String(error)}`;
  }
}
