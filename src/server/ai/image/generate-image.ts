import { GoogleGenAI, Modality } from '@google/genai'
import { vault } from '@/lib/vault'
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

interface NanoBananaResult {
  prompt: string
  b64_json: string
  mimeType: string
  error?: never
}

interface ImageError {
  error: string
  url?: never
}

type GenerateResult = ImageResult | ImageError

type GenerateBase64Result = Base64ImageResult | ImageError

type GenerateNanoBananaResult = NanoBananaResult | ImageError

const GEMINI_ASPECT_RATIOS = ['1:1', '3:4', '4:3', '9:16', '16:9'] as const

type GeminiAspectRatio = typeof GEMINI_ASPECT_RATIOS[number]

export async function generateIdeogramImage(
  prompt: string,
  version = 1,
  magicPromptOn = false,
): Promise<GenerateResult> {
  const ideogramKey = await vault.get('IDEOGRAM')
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
    const openai = await getOpenAIClient()
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

export async function generateNanoBananaImage(
  prompt: string,
  model: 'flash' | 'pro' = 'flash',
  aspectRatio: GeminiAspectRatio = '16:9',
): Promise<GenerateNanoBananaResult> {
  const apiKey = await vault.get('GEMINI_API_KEY')
  if (!apiKey) return { error: 'Gemini API key is not configured.' }

  try {
    const ai = new GoogleGenAI({ apiKey })
    const modelName = model === 'pro' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-preview-image'
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt || 'A professional blog header image',
      config: {
        responseModalities: [Modality.IMAGE],
        ...(model === 'pro' ? { imageConfig: { aspectRatio } } : {}),
      },
    })

    const part = response.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)
    const b64 = part?.inlineData?.data
    const mimeType = part?.inlineData?.mimeType ?? 'image/png'

    if (!b64) return { error: 'Nano Banana returned no image data' }

    return {
      b64_json: b64,
      mimeType,
      prompt,
    }
  } catch (err) {
    return { error: `Nano Banana: ${err instanceof Error ? err.message : String(err)}` }
  }
}

export async function generateImagenImage(
  prompt: string,
  aspectRatio: GeminiAspectRatio = '16:9',
  numberOfImages = 1,
): Promise<GenerateBase64Result> {
  const apiKey = await vault.get('GEMINI_API_KEY')
  if (!apiKey) return { error: 'Gemini API key is not configured.' }

  try {
    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-preview-06-06',
      prompt: prompt || 'A professional blog header image',
      config: {
        numberOfImages,
        aspectRatio,
      },
    })

    const b64 = response.generatedImages?.[0]?.image?.imageBytes
    if (!b64) return { error: 'Imagen returned no image data' }

    return {
      b64_json: b64,
      output_format: 'png',
      prompt,
      resolution: aspectRatio,
    }
  } catch (err) {
    return { error: `Imagen: ${err instanceof Error ? err.message : String(err)}` }
  }
}
