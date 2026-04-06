import { MODELS } from '../clients';
import { callModel } from '../providers';

export async function createFacebookPost(elements: string, slug: string) {
  try {
    const { text } = await callModel({
      model: MODELS.OPENAI_DEFAULT,
      system:
        'You turn blog posts and articles into Facebook posts. The post should be human sounding and NOT cliche. Use emojis and hashtags for emphasis, but no markdown or formatting like bold or italics. ' +
        `Use this URL format for the post slug: https://nordwebb.com/${slug}/.`,
      messages: [{ role: 'user', content: elements }],
      temperature: 1,
    });

    return text;
  } catch (error) {
    return `An error occurred: ${error instanceof Error ? error.message : String(error)}`;
  }
}
