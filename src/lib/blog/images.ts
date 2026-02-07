import { api, apiPost, apiPostForm } from '@/lib/api'

export interface BlogImageResponse {
  new_url: string
}

interface RegenerateBlogImagePayload {
  post_id: number
  image_number: number
  version?: number
  magic_prompt?: boolean
  force_prompt?: string
  provider?: 'ideogram' | 'gpt-image' | 'nano-banana' | 'imagen'
  gpt_quality?: 'low' | 'medium' | 'high'
  gpt_size?: '1024x1024' | '1536x1024' | '1024x1536' | 'auto'
  gpt_background?: 'auto' | 'transparent' | 'opaque'
  gpt_output_format?: 'png' | 'jpeg' | 'webp'
  nano_model?: 'flash' | 'pro'
  aspect_ratio?: string
}

export async function regenerateBlogImage(payload: RegenerateBlogImagePayload) {
  return apiPost<BlogImageResponse>('/api/aurora/blog/images/regenerate/', payload)
}

interface UploadBlogPostImagePayload {
  post_id: number
  image_number: number
  image: File
}

export async function uploadBlogPostImage(payload: UploadBlogPostImagePayload): Promise<BlogImageResponse> {
  const formData = new FormData()
  formData.append('post_id', String(payload.post_id))
  formData.append('image_number', String(payload.image_number))
  formData.append('image', payload.image)

  return apiPostForm<BlogImageResponse>('/api/aurora/blog/images/upload', formData)
}

interface UseStockPhotoPayload {
  post_id: number
  image_number: number
  image_url: string
}

export async function useStockPhoto(payload: UseStockPhotoPayload) {
  return apiPost<BlogImageResponse>('/api/aurora/blog/images/stock_photos/use', payload)
}

export interface PexelsImage {
  id: number
  width?: number
  height?: number
  photographer: string
  src: {
    original: string
    large: string
    medium: string
  }
}

export interface SearchImagesResponse {
  page: number
  per_page: number
  total_results: number
  images: PexelsImage[]
}

export async function searchStockPhotos(
  query: string,
  page = 1,
  perPage = 12,
  orientation?: 'landscape' | 'portrait' | 'square',
  color?: string,
) {
  return api<SearchImagesResponse>('/api/aurora/blog/images/stock_photos/search', {
    method: 'GET',
    params: {
      query,
      page,
      per_page: perPage,
      ...(orientation ? { orientation } : {}),
      ...(color ? { color } : {}),
    },
  })
}
