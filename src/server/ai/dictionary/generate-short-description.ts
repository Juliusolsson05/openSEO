import { getOpenAIClient, MODELS } from '../clients';
import { parseJsonResponse } from '../utils';

export async function generateShortDescription(word: string, subject: string, language: string) {
  try {
    const messages = [
      {
        role: 'system' as const,
        content:
          'You are an expert writer. Generate a short description for the given word. Ensure the description is detailed, informative, and relevant to the given subject. The description should be grammatically correct and professional sounding, and the English should still be relatively easy to read. The most important part is that the description is highly SEO-friendly and includes relevant keywords for SEO.',
      },
      {
        role: 'user' as const,
        content: `Generate a short description (around 25 words) for the word '${word}' in the context of the subject: ${subject}. Write the description in ${language}.`,
      },
    ];

    const response = await getOpenAIClient().chat.completions.create({
      model: MODELS.OPENAI_DEFAULT,
      messages,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'generate_short_description',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              description: { type: 'string', description: 'A short description for the word. Should be around 25 words.' },
            },
            required: ['description'],
            additionalProperties: false,
          },
        },
      },
    });

    const parsed = parseJsonResponse<{ description: string }>(response);
    return parsed.description ?? '';
  } catch (error) {
    return `An error occurred: ${error instanceof Error ? error.message : String(error)}`;
  }
}
