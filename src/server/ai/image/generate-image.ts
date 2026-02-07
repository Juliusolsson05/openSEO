import { getOpenAIClient } from '../clients'

interface ImageResult {
  is_image_safe?: boolean
  prompt: string
  resolution?: string
  url: string
  error?: never
}

interface Base64ImageResult {
  prompt: string
  resolution?: string
  b64_json: string
  output_format: 'png' | 'jpeg' | 'webp'
  error?: never
}

interface ImageError {
  error: string
  url?: never
}

type GenerateResult = ImageResult | ImageError

type GenerateBase64Result = Base64ImageResult | ImageError

export async function generateIdeogramImage(
  prompt: string,
  version = 1,
  magicPromptOn = false,
): Promise<GenerateResult> {
  const ideogramKey = process.env.IDEOGRAM
  if (!ideogramKey) return { error: 'Ideogram API key is not configured.' }

  try {
    const versions: Record<number, string> = { 1: 'V_1_TURBO', 2: 'V_2_TURBO', 3: 'V_2' }
    const model = versions[version] ?? 'V_1'

    const response = await fetch('https://api.ideogram.ai/generate', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'Api-Key': ideogramKey,
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

    if (!response.ok) return { error: `Ideogram: status ${response.status}` }

    const json = (await response.json()) as {
      data: Array<{ is_image_safe: boolean; prompt: string; resolution: string; url: string }>
    }

    const img = json.data?.[0]
    if (!img?.url) return { error: 'Ideogram returned no image' }

    return {
      is_image_safe: img.is_image_safe,
      prompt: img.prompt,
      resolution: img.resolution,
      url: img.url,
    }
  } catch (err) {
    return { error: `Ideogram: ${err instanceof Error ? err.message : String(err)}` }
  }
}

export async function generateGptImage(
  prompt: string,
  quality: 'low' | 'medium' | 'high' = 'medium',
  size: '1024x1024' | '1536x1024' | '1024x1536' | 'auto' = 'auto',
  background: 'auto' | 'transparent' | 'opaque' = 'auto',
  outputFormat: 'png' | 'jpeg' | 'webp' = 'png',
): Promise<GenerateBase64Result> {
  try {
    const openai = getOpenAIClient()
    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: prompt || 'A professional blog header image',
      quality,
      size,
      background,
      output_format: outputFormat,
    })

    const img = response.data?.[0]
    if (!img?.b64_json) return { error: 'GPT Image returned no image data' }

    return {
      prompt,
      resolution: size,
      b64_json: img.b64_json,
      output_format: outputFormat,
    }
  } catch (err) {
    return { error: `GPT Image: ${err instanceof Error ? err.message : String(err)}` }
  }
}
