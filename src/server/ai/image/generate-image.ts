import { getOpenAIClient } from '../clients'

interface ImageResult {
  is_image_safe?: boolean
  prompt: string
  resolution?: string
  url: string
  error?: never
}

interface ImageError {
  error: string
  url?: never
}

type GenerateResult = ImageResult | ImageError

/**
 * Try Ideogram first, fall back to DALL-E 3 if Ideogram fails.
 */
export async function generateImage(
  prompt: string,
  version = 1,
  magicPromptOn = false,
): Promise<GenerateResult> {
  // Try Ideogram first
  const ideogramKey = process.env.IDEOGRAM
  if (ideogramKey) {
    const result = await tryIdeogram(prompt, version, magicPromptOn, ideogramKey)
    if ('url' in result && result.url) return result
    console.warn(`[ImageGen] Ideogram failed: ${(result as ImageError).error}, falling back to DALL-E`)
  }

  // Fallback to DALL-E 3
  return tryDallE(prompt)
}

async function tryIdeogram(
  prompt: string,
  version: number,
  magicPromptOn: boolean,
  apiKey: string,
): Promise<GenerateResult> {
  try {
    const versions: Record<number, string> = { 1: 'V_1_TURBO', 2: 'V_2_TURBO', 3: 'V_2' }
    const model = versions[version] ?? 'V_1'

    const response = await fetch('https://api.ideogram.ai/generate', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'Api-Key': apiKey,
      },
      body: JSON.stringify({
        image_request: {
          model,
          magic_prompt_option: magicPromptOn ? 'ON' : 'OFF',
          prompt,
          aspect_ratio: 'ASPECT_16_10',
        },
      }),
    })

    if (response.ok) {
      const json = (await response.json()) as {
        data: Array<{ is_image_safe: boolean; prompt: string; resolution: string; url: string }>
      }
      const img = json.data[0]
      return {
        is_image_safe: img.is_image_safe,
        prompt: img.prompt,
        resolution: img.resolution,
        url: img.url,
      }
    }

    return { error: `Ideogram: status ${response.status}` }
  } catch (err) {
    return { error: `Ideogram: ${err instanceof Error ? err.message : String(err)}` }
  }
}

async function tryDallE(prompt: string): Promise<GenerateResult> {
  try {
    const openai = getOpenAIClient()
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt || 'A professional blog header image',
      n: 1,
      size: '1792x1024',
      quality: 'standard',
    })

    const img = response.data?.[0]
    if (!img?.url) return { error: 'DALL-E returned no image' }

    return {
      is_image_safe: true,
      prompt: img.revised_prompt ?? prompt,
      resolution: '1792x1024',
      url: img.url,
    }
  } catch (err) {
    return { error: `DALL-E: ${err instanceof Error ? err.message : String(err)}` }
  }
}
