import { MODELS } from '../clients';
import { callModel } from '../providers';

export async function generateShortDescription(word: string, subject: string, language: string) {
  try {
    const { json } = await callModel<{ description: string }>({
      model: MODELS.OPENAI_DEFAULT,
      system:
        'You are an expert writer. Generate a short description for the given word. Ensure the description is detailed, informative, and relevant to the given subject. The description should be grammatically correct and professional sounding, and the English should still be relatively easy to read. The most important part is that the description is highly SEO-friendly and includes relevant keywords for SEO.',
      messages: [
        {
          role: 'user',
          content: `Generate a short description (around 25 words) for the word '${word}' in the context of the subject: ${subject}. Write the description in ${language}.`,
        },
      ],
      jsonSchema: {
        name: 'generate_short_description',
        schema: {
          type: 'object',
          properties: {
            description: { type: 'string', description: 'A short description for the word. Should be around 25 words.' },
          },
          required: ['description'],
          additionalProperties: false,
        },
      },
    });

    return json?.description ?? '';
  } catch (error) {
    return `An error occurred: ${error instanceof Error ? error.message : String(error)}`;
  }
}
