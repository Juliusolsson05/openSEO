import { getAnthropicClient, getOpenAIClient, MODELS } from '../clients';

export async function createFacebookPost(elements: string, slug: string) {
  try {
    const systemMessage = {
      role: 'system' as const,
      content:
        'You turn blog posts and articles into Facebook posts. The post should be human sounding and NOT cliche. Use emojis and hashtags for emphasis, but no markdown or formatting like bold or italics. ' +
        `Use this URL format for the post slug: https://nordwebb.com/${slug}/.`,
    };

    const userMessage = { role: 'user' as const, content: elements };

    const response = await getOpenAIClient().chat.completions.create({
      model: MODELS.OPENAI_DEFAULT,
      messages: [systemMessage, userMessage],
      temperature: 1,
      max_completion_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      response_format: { type: 'text' },
    });

    return response.choices[0]?.message.content ?? '';
  } catch (error) {
    return `An error occurred: ${error instanceof Error ? error.message : String(error)}`;
  }
}

void getAnthropicClient;
