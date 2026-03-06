interface Base64ImageResult {
  prompt: string
  resolution?: string
  b64_json: string
  output_format: 'png'
  error?: never
}

interface ImageError {
  error: string
  b64_json?: never
}

type GenerateResult = Base64ImageResult | ImageError

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        inlineData?: {
          data?: string
        }
      }>
    }
  }>
}

const MODEL = 'gemini-2.0-flash-preview-image-generation'

export async function generateGeminiImage(
  prompt: string,
  aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9' = '16:9',
): Promise<GenerateResult> {
  const apiKey = await vault.get('GEMINI_API_KEY')
  if (!apiKey) return { error: 'Gemini API key is not configured.' }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `Generate an image with aspect ratio ${aspectRatio}: ${prompt || 'A professional blog header image'}` }],
            },
          ],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
          },
        }),
      },
    )

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      return { error: `Gemini: status ${res.status}${body ? ` - ${body}` : ''}` }
    }

    const data = (await res.json()) as GeminiResponse
    const parts = data.candidates?.[0]?.content?.parts ?? []
    const b64 = parts.find((part) => part.inlineData?.data)?.inlineData?.data

    if (!b64) return { error: 'Gemini returned no image data' }

    return {
      prompt,
      resolution: aspectRatio,
      b64_json: b64,
      output_format: 'png',
    }
  } catch (err) {
    return { error: `Gemini: ${err instanceof Error ? err.message : String(err)}` }
  }
}
import { vault } from '@/lib/vault'
