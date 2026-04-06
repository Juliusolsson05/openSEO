import { MODELS } from '../clients';
import { callModel, type ChatMessage as ProviderMessage } from '../providers';

import type { ChatMessage } from '@/types/quillo';

export async function continueChat(messages: ChatMessage[], userQuestion: string) {
  try {
    messages.push({
      role: 'user',
      content: `The user has provided the following question, if the question is something that is not related to the blog post, refuse to answer it, but if the qusetion is related to the blog post you should not say that, then just go on as normal: ${userQuestion}`,
    });

    // Extract the first system message for the provider's system field.
    const systemMsg = messages.find((m) => m.role === 'system')?.content;
    const nonSystem: ProviderMessage[] = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    const { text, raw } = await callModel({
      model: MODELS.OPENAI_DEFAULT,
      system: systemMsg,
      messages: nonSystem,
    });

    const newAnalysisResult: unknown = text ?? '';
    messages.push({ role: 'assistant', content: text ?? '' });

    return {
      new_analysis_result: newAnalysisResult,
      raw_response: raw,
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
