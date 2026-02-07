export type ImageStudioProvider = 'ideogram' | 'gpt-image' | 'nano-banana' | 'imagen' | 'stock' | 'upload' | 'photopea'

export type HistoryEntry = {
  url: string
  provider: ImageStudioProvider
  timestamp: number
}
