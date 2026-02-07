import { apiPost } from '@/lib/api'

interface GenerateImagesPayload {
  post_id: number
  version: 1 | 2 | 3
  force?: boolean
  magic_prompt?: boolean
  gpt_prompt?: boolean
  quality_thumbnail?: boolean
}

export function generateImages(payload: GenerateImagesPayload) {
  return apiPost('/api/aurora/blog/images/generate/', {
    force: false,
    magic_prompt: true,
    gpt_prompt: true,
    quality_thumbnail: false,
    ...payload,
  })
}
