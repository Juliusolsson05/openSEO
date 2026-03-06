import { getAnthropicClient, getOpenAIClient, MODELS } from '../clients';

import type { ChatMessage } from '@/types/quillo';

export async function continueChat(messages: ChatMessage[], userQuestion: string) {
  try {
    messages.push({
      role: 'user',
      content: `The user has provided the following question, if the question is something that is not related to the blog post, refuse to answer it, but if the qusetion is related to the blog post you should not say that, then just go on as normal: ${userQuestion}`,
    });

    const response = await (await getOpenAIClient()).chat.completions.create({
      model: MODELS.OPENAI_DEFAULT,
      messages,
    });

    const message = response.choices[0]?.message;
    let newAnalysisResult: unknown;

    if (message?.function_call) {
      try {
        newAnalysisResult = JSON.parse(message.function_call.arguments);
      } catch (jsonError) {
        const content = message.content ?? '';
        newAnalysisResult = {
          error: 'Failed to parse API response',
          details: jsonError instanceof Error ? jsonError.message : String(jsonError),
          raw_content: content.slice(0, 1000),
        };
      }
    } else {
      newAnalysisResult = message?.content ?? '';
    }

    messages.push({ role: 'assistant', content: message?.content ?? '' });

    return {
      new_analysis_result: newAnalysisResult,
      raw_response: response,
      messages,
    };
  } catch (error) {
    return {
      new_analysis_result: { error: error instanceof Error ? error.message : String(error) },
      raw_response: null,
      messages,
    };
  }
}

void getAnthropicClient;
