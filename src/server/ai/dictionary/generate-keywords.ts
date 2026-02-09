import { getAnthropicClient, getOpenAIClient, MODELS } from '../clients';

export async function generateKeywords(letter: string, numWords: number, subject: string, language: string) {
  try {
    const messages = [
      {
        role: 'system' as const,
        content:
          'You are a keyword generator. Generate a list of keywords that start with the given letter, related to the given subject, and provide a one-paragraph description for each keyword. Ensure the keywords are grammatically correct and relevant to the subject. Try to keep the keywords one word only but the most important part is that the words and descriptions are HIGHLY SEO friendly, and also offers a short and objective definition of the word in the context of the given subject.You should also give a focus keyword which should be what users is most likely to search for when they want to learn the definition of the keyword.',
      },
      {
        role: 'user' as const,
        content: `Generate ${numWords} keywords starting with the letter '${letter}' for the subject: ${subject}. Write the keywords and descriptions in ${language} and ensure they are professional sounding and relevant. It is VERY important that ALL the words start with the letter: '${letter}'`,
      },
    ];

    const functionParameters = {
      type: 'object' as const,
      properties: Object.fromEntries(
        Array.from({ length: numWords }, (_, idx) => {
          const i = idx + 1;
          return [
            `keyword_${i}`,
            {
              type: 'object' as const,
              properties: {
                keyword: { type: 'string' as const, description: `Keyword ${i} starting with ${letter} (first letter should always be in uppercase)` },
                description: { type: 'string' as const, description: `Description for keyword ${i}` },
                focus_keyword: { type: 'string' as const, description: 'What users is most likely to search about if they want to learn about the word.' },
              },
              required: ['keyword', 'description', 'focus_keyword'] as const,
            },
          ];
        }),
      ),
      required: Array.from({ length: numWords }, (_, idx) => `keyword_${idx + 1}`),
    };

    const response = await getOpenAIClient().chat.completions.create({
      model: MODELS.OPENAI_DEFAULT,
      messages,
      tools: [{
        type: 'function' as const,
        function: {
          name: 'generate_keywords_with_descriptions',
          description: `Generates keywords starting '${letter}', along with descriptions, based on the given subject. It is VERY important that ALL the words start with '${letter}'`,
          parameters: functionParameters,
        },
      }],
      tool_choice: {
        type: 'function' as const,
        function: { name: 'generate_keywords_with_descriptions' },
      },
    })

    const toolCall = response.choices[0]?.message?.tool_calls?.[0]
    const args = toolCall?.function?.arguments
    return JSON.parse(args ?? '{}')
  } catch (error) {
    return `An error occurred: ${error instanceof Error ? error.message : String(error)}`;
  }
}

void getAnthropicClient;
