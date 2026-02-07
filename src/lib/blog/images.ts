import { apiPost, apiPostForm } from '@/lib/api'

export interface BlogImageResponse {
  new_url: string
}

interface RegenerateBlogImagePayload {
  post_id: number
  image_number: number
  version: number
  magic_prompt: boolean
  force_prompt?: string
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
