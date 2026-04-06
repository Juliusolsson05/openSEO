'use client'

import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { ImageControlPanel } from './ImageControlPanel'
import { ImagePreviewPanel } from './ImagePreviewPanel'
import { ImageHistory } from './ImageHistory'
import { PhotopeaEditor } from './PhotopeaEditor'
import { useImageStudioState } from './useImageStudioState'

interface Props {
  open: boolean
  onClose: () => void
  blogId: number
  imageNumber: number
  currentUrl?: string
  currentDescription?: string
  postTitle?: string
  onImageApplied?: (newUrl: string) => Promise<void> | void
}

export function ImageStudio(props: Props) {
  const state = useImageStudioState(props)

  return (
    <>
      <Modal open={props.open} onClose={props.onClose} zClass="z-[60]">
        <div className="flex w-[min(1100px,95vw)] max-h-[85vh] flex-col overflow-hidden rounded-lg border border-border bg-background shadow-xl">
          <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-3">
            <h2 className="text-base font-semibold">🎨 Image Studio</h2>
            <div className="flex items-center gap-2">
              {state.editableImageUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => state.setPhotopeaOpen(true)}
                >
                  <Pencil className="h-3 w-3" /> Edit in Photopea
                </Button>
              )}
              <button
                onClick={props.onClose}
                className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Body — two panels */}
          <div className="flex flex-1 min-h-0 overflow-hidden">
            <div className="flex w-[55%] shrink-0 p-4">
              <ImagePreviewPanel
                imageUrl={state.selectedUrl}
                provider={state.provider}
                isGenerating={state.isGenerating}
              />
            </div>

            <div className="flex w-[45%] flex-col border-l border-border">
              <div className="flex-1 overflow-y-auto p-4">
                <ImageControlPanel
                  provider={state.provider}
                  setProvider={state.setProvider}
                  prompt={state.prompt}
                  setPrompt={state.setPrompt}
                  postTitle={props.postTitle ?? ''}
                  currentDescription={props.currentDescription ?? ''}
                  ideogramQuality={state.ideogramQuality}
                  setIdeogramQuality={state.setIdeogramQuality}
                  magicPrompt={state.magicPrompt}
                  setMagicPrompt={state.setMagicPrompt}
                  gptQuality={state.gptQuality}
                  setGptQuality={state.setGptQuality}
                  gptSize={state.gptSize}
                  setGptSize={state.setGptSize}
                  gptBackground={state.gptBackground}
                  setGptBackground={state.setGptBackground}
                  nanoModel={state.nanoModel}
                  setNanoModel={state.setNanoModel}
                  nanoAspectRatio={state.nanoAspectRatio}
                  setNanoAspectRatio={state.setNanoAspectRatio}
                  imagenAspectRatio={state.imagenAspectRatio}
                  setImagenAspectRatio={state.setImagenAspectRatio}
                  onGenerate={state.onGenerate}
                  isGenerating={state.isGenerating}
                  onStockSelect={state.onStockSelect}
                  onUploadSelect={state.onUploadSelect}
                  currentImageUrl={state.editableImageUrl}
                  onOpenPhotopea={() => state.setPhotopeaOpen(true)}
                />
              </div>
            </div>
          </div>

          <ImageHistory
            items={state.history}
            activeUrl={state.selectedUrl}
            onSelect={state.setSelectedUrl}
            onApply={state.onApply}
            onCancel={props.onClose}
            applying={state.isApplying}
          />
        </div>
      </Modal>

      {state.editableImageUrl && (
        <PhotopeaEditor
          open={state.photopeaOpen}
          onClose={() => state.setPhotopeaOpen(false)}
          imageUrl={state.editableImageUrl}
          blogId={props.blogId}
          imageNumber={props.imageNumber}
          onSaved={(newUrl) => {
            state.addToHistory(newUrl, 'photopea')
            state.setPhotopeaOpen(false)
          }}
        />
      )}
    </>
  )
}
