import { ImageIcon } from 'lucide-react'

type ImageElementProps = {
  alt?: string
  caption?: string
  url?: string
}

export function ImageElement({ alt = 'Post image', caption, url }: ImageElementProps) {
  return (
    <figure className="space-y-2">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={alt} className="w-full rounded-xl border border-neutral-200" />
      ) : (
        <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100">
          <div className="flex items-center gap-2 text-neutral-400">
            <ImageIcon className="h-5 w-5" />
            <span className="text-sm">{alt}</span>
          </div>
        </div>
      )}
      {caption ? <figcaption className="text-xs text-neutral-500">{caption}</figcaption> : null}
    </figure>
  )
}
