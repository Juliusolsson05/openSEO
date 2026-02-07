export type ImageStudioProvider = 'ideogram' | 'gpt-image' | 'stock' | 'upload'

export type HistoryEntry = {
  url: string
  provider: ImageStudioProvider
  timestamp: number
}
