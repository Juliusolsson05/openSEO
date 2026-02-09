import { getAnthropicClient, getOpenAIClient, MODELS } from '../clients';

export async function generateShortDescription(word: string, subject: string, language: string) {
  try {
    const messages = [
      {
        role: 'system' as const,
        content:
          'You are an expert writer. Generate a one-paragraph description for the given word. Ensure the description is detailed, informative, and relevant to the given subject. The description should be grammatically correct and professional sounding, and the English should still be relatively easy. The most important part is that the description is HIGHLY SEO friendly and includes relevant keywords for SEO.',
      },
      {
        role: 'user' as const,
        content: `Generate a one-paragraph description for the word '${word}' in the context of the subject: ${subject}. Write the description in ${language}.`,
      },
    ];

    const response = await getOpenAIClient().chat.completions.create({
      model: MODELS.OPENAI_DEFAULT,
      messages,
      tools: [{
        type: 'function' as const,
        function: {
          name: 'generate_short_description',
          description: 'Generates a one-paragraph description for the given word in the context of the given subject.',
          parameters: {
            type: 'object' as const,
            properties: {
              description: { type: 'string' as const, description: 'A short description for the word. Should ONLY be around 25 words.' },
            },
            required: ['description'],
          },
        },
      }],
      tool_choice: {
        type: 'function' as const,
        function: { name: 'generate_short_description' },
      },
    });

    const toolCall = response.choices[0]?.message?.tool_calls?.[0]
    const parsed = JSON.parse(toolCall?.function?.arguments ?? '{}') as { description?: string };
    return parsed.description ?? '';
  } catch (error) {
    return `An error occurred: ${error instanceof Error ? error.message : String(error)}`;
  }
}

void getAnthropicClient;
