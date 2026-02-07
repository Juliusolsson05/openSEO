import { getAnthropicClient, getOpenAIClient, MODELS } from '../../clients';

type Message = {
  role: 'system' | 'user' | 'assistant';
  content: Array<{ type: 'text'; text: string }>;
};

export async function getImageSpecifications(blogPost: unknown, messages: Message[]) {
  messages.push({ role: 'user', content: [{ type: 'text', text: `Review this blog post and provide specs for existing images only. Include style_guide and per-image alt+description+element_id. Blog Post: ${JSON.stringify(blogPost)}` }] });

  const responseSchema = {
    name: 'image_specifications',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        style_guide: { type: 'string' },
        images: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              element_id: { type: 'integer' },
              alt_text: { type: 'string' },
              description: { type: 'string' },
            },
            required: ['element_id', 'alt_text', 'description'],
            additionalProperties: false,
          },
        },
      },
      required: ['style_guide', 'images'],
      additionalProperties: false,
    },
  } as const;

  const response = await getOpenAIClient().chat.completions.create({
    model: MODELS.OPENAI_DEFAULT,
    messages,
    response_format: { type: 'json_schema', json_schema: responseSchema },
  });

  messages.push({ role: 'assistant', content: [{ type: 'text', text: response.choices[0]?.message.content ?? '' }] });
  return { response, messages };
}

void getAnthropicClient;
