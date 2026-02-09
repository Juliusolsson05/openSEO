import { getOpenAIClient, MODELS } from '../clients';
import { parseJsonResponse } from '../utils';

export async function generateKeywords(letter: string, numWords: number, subject: string, language: string) {
  try {
    const messages = [
      {
        role: 'system' as const,
        content:
          'You are a keyword generator. Generate a list of keywords that start with the given letter, related to the given subject, and provide a one-paragraph description for each keyword. Ensure the keywords are grammatically correct and relevant to the subject. Try to keep the keywords one word only but the most important part is that the words and descriptions are highly SEO-friendly and offer a short and objective definition of the word in the context of the given subject. You should also give a focus keyword which should be what users are most likely to search for when they want to learn the definition of the keyword.',
      },
      {
        role: 'user' as const,
        content: `Generate ${numWords} keywords starting with the letter '${letter}' for the subject: ${subject}. Write the keywords and descriptions in ${language} and ensure they are professional sounding and relevant. It is very important that ALL the words start with the letter: '${letter}'`,
      },
    ];

    const keywordProperties: Record<string, any> = {};
    const requiredKeys: string[] = [];

    for (let i = 1; i <= numWords; i++) {
      const key = `keyword_${i}`;
      keywordProperties[key] = {
        type: 'object',
        properties: {
          keyword: { type: 'string', description: `Keyword ${i} starting with ${letter} (first letter should always be in uppercase)` },
          description: { type: 'string', description: `Description for keyword ${i}` },
          focus_keyword: { type: 'string', description: 'What users are most likely to search for if they want to learn about the word.' },
        },
        required: ['keyword', 'description', 'focus_keyword'],
        additionalProperties: false,
      };
      requiredKeys.push(key);
    }

    const response = await getOpenAIClient().chat.completions.create({
      model: MODELS.OPENAI_DEFAULT,
      messages,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'generate_keywords_with_descriptions',
          strict: true,
          schema: {
            type: 'object',
            properties: keywordProperties,
            required: requiredKeys,
            additionalProperties: false,
          },
        },
      },
    });

    return parseJsonResponse(response);
  } catch (error) {
    return `An error occurred: ${error instanceof Error ? error.message : String(error)}`;
  }
}
