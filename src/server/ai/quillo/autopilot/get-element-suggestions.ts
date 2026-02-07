import { RESTRICTED_BLOCK_SCHEMAS } from '../../constants/restricted-schemas';
import { getAnthropicClient, getOpenAIClient, MODELS } from '../../clients';

type Message = {
  role: 'system' | 'user' | 'assistant';
  content: Array<{ type: 'text'; text: string }>;
};

export async function getElementSuggestions(blogPost: unknown) {
  const messages: Message[] = [
    { role: 'system', content: [{ type: 'text', text: 'You are a specialized AI assistant focused on enhancing blog post content. Suggest around 5-6 useful elements and never suggest anything after FAQ/conclusion.' }] },
    { role: 'user', content: [{ type: 'text', text: `Review this blog post and suggest what elements to add: ${JSON.stringify(blogPost)} Available Element Types: ${JSON.stringify(RESTRICTED_BLOCK_SCHEMAS)}` }] },
  ];

  const responseSchema = {
    name: 'blog_improvement_suggestions',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        recommendations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              element_type: { type: 'string', enum: Object.keys(RESTRICTED_BLOCK_SCHEMAS) },
              content_description: { type: 'string' },
              location: { type: 'object', properties: { after_element_id: { type: 'integer' } }, required: ['after_element_id'], additionalProperties: false },
              motivation: { type: 'string' },
            },
            required: ['element_type', 'content_description', 'location', 'motivation'],
            additionalProperties: false,
          },
        },
      },
      required: ['recommendations'],
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
