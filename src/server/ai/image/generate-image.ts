import { getAnthropicClient, getOpenAIClient, MODELS } from '../clients';

export async function generateImage(prompt: string, version = 1, magicPromptOn = false) {
  try {
    const versions: Record<number, string> = { 1: 'V_1_TURBO', 2: 'V_2_TURBO', 3: 'V_2' };
    const model = versions[version] ?? 'V_1';

    const payload = {
      image_request: {
        model,
        magic_prompt_option: magicPromptOn ? 'ON' : 'OFF',
        prompt,
        aspect_ratio: 'ASPECT_16_10',
      },
    };

    const response = await fetch('https://api.ideogram.ai/generate', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'Api-Key': process.env.IDEOGRAM ?? '',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const json = (await response.json()) as {
        data: Array<{ is_image_safe: boolean; prompt: string; resolution: string; url: string }>;
      };
      const imageInfo = json.data[0];
      return {
        is_image_safe: imageInfo.is_image_safe,
        prompt: imageInfo.prompt,
        resolution: imageInfo.resolution,
        url: imageInfo.url,
      };
    }

    return { error: `Request failed with status code ${response.status}` };
  } catch (error) {
    return { error: `An error occurred: ${error instanceof Error ? error.message : String(error)}` };
  }
}

void getAnthropicClient;
void getOpenAIClient;
void MODELS;
