import { getAnthropicClient, getOpenAIClient, MODELS } from '../clients';

export async function processHyperlinks(element: Record<string, unknown>) {
  try {
    const systemMessage =
      'You are responsible for taking a text paragraph and choosing the three most relevant hyperlink positions to keep. Select hyperlink positions and words that are most relevant to the text to make it more engaging. What only keeping three hyperlinks mean is the following, as you can see we have hyperlinks and we have matched_positions, keeping three hyperlinks is not only to keep three hyperlinks, but over hte whole element we should only have three matched positions, so if we add up the len of all the matched_positions array the result should be max 3.  You must choose at least two hyperlinks, but no more than three in total.';

    const messages = [
      { role: 'system' as const, content: systemMessage },
      { role: 'user' as const, content: JSON.stringify(element) },
    ];

    const functionParameters = {
      name: 'hyperlink_response',
      description: 'Process hyperlinks in the given text',
      parameters: {
        type: 'object',
        properties: {
          hyperlink: {
            type: 'object',
            properties: {
              matched_keywords: {
                type: 'object',
                properties: {
                  text: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        keyword: { type: 'string' },
                        description: { type: 'string' },
                        matched_positions: { type: 'array', items: { type: 'integer' } },
                      },
                      required: ['keyword', 'description', 'matched_positions'],
                    },
                  },
                },
                required: ['text'],
              },
            },
            required: ['matched_keywords'],
          },
        },
        required: ['hyperlink'],
      },
    };

    const response = await getOpenAIClient().chat.completions.create({
      model: MODELS.OPENAI_DEFAULT,
      messages,
      functions: [functionParameters],
      function_call: { name: 'hyperlink_response' },
    });

    const functionCall = response.choices[0]?.message.function_call;
    if (!functionCall) {
      throw new Error('No function call in the API response');
    }

    const result = JSON.parse(functionCall.arguments) as { hyperlink?: unknown };
    if (!result.hyperlink || typeof result.hyperlink !== 'object' || !(result.hyperlink as Record<string, unknown>).matched_keywords) {
      throw new Error('Invalid response structure from API');
    }

    element.hyperlink = result.hyperlink;
    return element;
  } catch {
    return element;
  }
}

void getAnthropicClient;
