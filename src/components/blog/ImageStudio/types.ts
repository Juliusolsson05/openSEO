export type ImageStudioProvider = 'ideogram' | 'gpt-image' | 'stock' | 'upload' | 'photopea'

export type HistoryEntry = {
  url: string
  provider: ImageStudioProvider
  timestamp: number
}
