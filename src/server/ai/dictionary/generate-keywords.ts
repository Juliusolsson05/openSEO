import { MODELS } from '../clients';
import { callModel } from '../providers';

export async function generateKeywords(letter: string, numWords: number, subject: string, language: string) {
  try {
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

    const { json } = await callModel<Record<string, unknown>>({
      model: MODELS.OPENAI_DEFAULT,
      system:
        'You are a keyword generator. Generate a list of keywords that start with the given letter, related to the given subject, and provide a one-paragraph description for each keyword. Ensure the keywords are grammatically correct and relevant to the subject. Try to keep the keywords one word only but the most important part is that the words and descriptions are highly SEO-friendly and offer a short and objective definition of the word in the context of the given subject. You should also give a focus keyword which should be what users are most likely to search for when they want to learn the definition of the keyword.',
      messages: [
        {
          role: 'user',
          content: `Generate ${numWords} keywords starting with the letter '${letter}' for the subject: ${subject}. Write the keywords and descriptions in ${language} and ensure they are professional sounding and relevant. It is very important that ALL the words start with the letter: '${letter}'`,
        },
      ],
      jsonSchema: {
        name: 'generate_keywords_with_descriptions',
        schema: {
          type: 'object',
          properties: keywordProperties,
          required: requiredKeys,
          additionalProperties: false,
        },
      },
    });

    if (!json) throw new Error('generate-keywords: no JSON returned');
    return json;
  } catch (error) {
    return `An error occurred: ${error instanceof Error ? error.message : String(error)}`;
  }
}
