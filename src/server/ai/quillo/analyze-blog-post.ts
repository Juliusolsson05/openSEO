import { BLOCK_SCHEMAS } from '../constants/block-schemas';
import { getAnthropicClient, getOpenAIClient, MODELS } from '../clients';

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export async function analyzeBlogPost(postData: unknown) {
  const functionParameters = {
    type: 'object',
    properties: {
      overall_analysis: {
        type: 'object',
        properties: {
          overall_score: { type: 'integer', minimum: 1, maximum: 100 },
          summary: { type: 'string' },
          strengths: { type: 'array', items: { type: 'string' } },
          weaknesses: { type: 'array', items: { type: 'string' } },
        },
        required: ['overall_score', 'summary', 'strengths', 'weaknesses'],
      },
      seo_improvements: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            suggestion: { type: 'string' },
            reason: { type: 'string' },
            importance: { type: 'string', enum: ['Low', 'Medium', 'High'] },
          },
          required: ['suggestion', 'reason', 'importance'],
        },
      },
      content_improvements: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            element_id: { type: 'integer' },
            element_type: { type: 'string' },
            suggestion: { type: 'string' },
            reason: { type: 'string' },
            proposed_changes: { type: 'string' },
          },
          required: ['element_id', 'element_type', 'suggestion', 'reason', 'proposed_changes'],
        },
      },
      structure_improvements: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            suggestion: { type: 'string' },
            reason: { type: 'string' },
            proposed_changes: { type: 'string' },
          },
          required: ['suggestion', 'reason', 'proposed_changes'],
        },
      },
      recommended_additions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            element_type: { type: 'string' },
            reason: { type: 'string' },
            proposed_content: { type: 'string' },
          },
          required: ['element_type', 'reason', 'proposed_content'],
        },
      },
    },
    required: ['overall_analysis', 'seo_improvements', 'content_improvements', 'structure_improvements', 'recommended_additions'],
  } as const;

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are an AI assistant specialized in analyzing and improving blog posts. 
        You have deep knowledge of SEO, content writing, and blog structure.
        You understand the following blog element types and their structures:
        ${JSON.stringify(BLOCK_SCHEMAS, null, 2)}

        Analyze the given blog post thoroughly, considering its structure, content quality, SEO optimization, 
        and overall effectiveness. Provide detailed, actionable suggestions for improvement. 

        Use the following scoring framework to rate the blog post:

        10-20: Extremely Poor
        30-40: Poor
        50-60: Average
        70-80: Good
        90-100: Excellent

        When evaluating, be direct and honest. Do NOT sugarcoat your feedback. The content should sound human and NOT be repetitive.`,
    },
    {
      role: 'user',
      content: `Analyze the following blog post and provide comprehensive improvement suggestions. Be ruthless in your feedback - I appreciate direct, honest criticism: ${JSON.stringify(postData)}`,
    },
  ];

  const response = await getOpenAIClient().chat.completions.create({
    model: MODELS.OPENAI_DEFAULT,
    messages,
    tools: [{
      type: 'function' as const,
      function: {
        name: 'analyze_blog_post',
        description: 'Analyzes a blog post and provides structured, comprehensive improvement suggestions',
        parameters: functionParameters,
      },
    }],
    tool_choice: { type: 'function' as const, function: { name: 'analyze_blog_post' } },
    max_completion_tokens: 2000,
  });

  const jsonResponse = (response.choices[0]?.message?.tool_calls?.[0] as any)?.function?.arguments ?? '{}';
  const analysisResult = JSON.parse(jsonResponse);
  messages.push({ role: 'assistant', content: jsonResponse });

  return {
    analysis_result: analysisResult,
    raw_response: response,
    messages,
  };
}

void getAnthropicClient;
