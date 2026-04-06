import { NotFoundError, ValidationError } from '@/server/api/errors'
import { generateGptImage, generateIdeogramImage, generateImagenImage, generateNanoBananaImage } from '@/server/ai/image/generate-image'
import { uploadFromUrl, uploadFromBase64, uploadFromBinary } from '@/server/storage/upload'
import * as imageRepository from '@/server/repositories/image.repository'
import { vault } from '@/lib/vault'

const DEFAULT_PLACEHOLDER_URL = '/images/placeholder-cover.svg'

export class ImageService {
  async generateImages(companyId: number, payload: unknown) {
    const body = payload as {
      post_id?: number
      force?: boolean
      version?: number
      magic_prompt?: boolean
      quality_thumbnail?: boolean
      gpt_prompt?: boolean
    }

    const version = Number(body.version ?? 1)
    if (![1, 2, 3].includes(version)) throw new ValidationError('Invalid version. Please select a version between 1 and 3.')

    let blogPost = body.post_id
      ? await imageRepository.findBlogPost(companyId, body.post_id)
      : await imageRepository.findNextPendingBlogPost(companyId)

    if (!blogPost) throw new NotFoundError('No more blog posts to process or blog post not found.')

    const forceUpdate = Boolean(body.force)
    const coverImage = ((blogPost.cover_image ?? {}) as any) || {}
    const coverDescription = coverImage.description ?? ''
    const coverVersion = body.quality_thumbnail ? 2 : version

    if (forceUpdate || (coverImage.url ?? '') === DEFAULT_PLACEHOLDER_URL) {
      const img = await generateIdeogramImage(coverDescription, coverVersion, body.magic_prompt ?? true)
      if ((img as any).url) {
        const uploadedUrl = await uploadFromUrl((img as any).url, companyId, 'covers')
        if (uploadedUrl) coverImage.url = uploadedUrl
      }
    }

    await imageRepository.updateBlogPostCover(blogPost.id, coverImage)

    for (const element of blogPost.elements.filter((e) => e.element_type === 'IMAGE')) {
      const content = (element.content as any) || {}
      const description = content.description ?? ''
      if (forceUpdate || (content.url ?? '') === DEFAULT_PLACEHOLDER_URL) {
        const img = await generateIdeogramImage(description, version, body.magic_prompt ?? true)
        if ((img as any).url) {
          const uploadedUrl = await uploadFromUrl((img as any).url, companyId, 'covers')
          if (uploadedUrl) content.url = uploadedUrl
        }
      }
      await imageRepository.updateElementContent(element.id, content)
    }

    blogPost = await imageRepository.findBlogPost(companyId, blogPost.id)
    const allUpdated = !!blogPost &&
      (blogPost.cover_image as any)?.url !== DEFAULT_PLACEHOLDER_URL &&
      blogPost.elements.filter((e) => e.element_type === 'IMAGE').every((e) => ((e.content as any)?.url ?? '') !== DEFAULT_PLACEHOLDER_URL)

    if (allUpdated) {
      await imageRepository.updateBlogPostCover(blogPost!.id, blogPost!.cover_image, true)
    }

    const [total, processed] = await imageRepository.countImageGeneration(companyId)
    const next = await imageRepository.findNextPendingBlogPost(companyId)

    return {
      status: `Updated images for blog post: ${blogPost?.title_text ?? ''}`,
      next_post_id: next?.id ?? null,
      image_generations_done: processed,
      image_generations_left: total - processed,
      total_image_generations: total,
    }
  }

  async regenerateImage(companyId: number, payload: unknown) {
    const body = payload as {
      post_id?: number | string
      image_number?: number | string
      version?: number | string
      magic_prompt?: boolean
      force_prompt?: string
      provider?: 'ideogram' | 'gpt-image' | 'nano-banana' | 'imagen'
      gpt_quality?: 'low' | 'medium' | 'high'
      gpt_size?: '1024x1024' | '1536x1024' | '1024x1536' | 'auto'
      gpt_background?: 'auto' | 'transparent' | 'opaque'
      gpt_output_format?: 'png' | 'jpeg' | 'webp'
      nano_model?: 'flash' | 'pro'
      aspect_ratio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9'
    }
    if (!body.post_id) throw new ValidationError('post_id is required.')
    if (body.image_number === undefined || body.image_number === null || body.image_number === '') {
      throw new ValidationError('image_number is required.')
    }

    const imageNumber = Number(body.image_number)
    if (!Number.isInteger(imageNumber)) throw new ValidationError('image_number must be an integer.')

    const provider = body.provider ?? 'ideogram'
    const version = Number(body.version ?? 1)
    if (provider === 'ideogram') {
      if (!Number.isInteger(version)) throw new ValidationError('version must be an integer between 1 and 3.')
      if (![1, 2, 3].includes(version)) throw new ValidationError('Invalid version. Please select a version between 1 and 3.')
    }

    const generateAndUpload = async (description: string, folder: string) => {
      if (provider === 'gpt-image') {
        const img = await generateGptImage(
          description,
          body.gpt_quality ?? 'medium',
          body.gpt_size ?? 'auto',
          body.gpt_background ?? 'auto',
          body.gpt_output_format ?? 'png',
        )
        if ((img as any).error) {
          console.error(`[ImageService] GPT image generation failed: ${(img as any).error}`)
          throw new ValidationError(`Image generation failed: ${(img as any).error}`)
        }
        return uploadFromBase64(
          (img as any).b64_json,
          companyId,
          folder,
          (img as any).output_format === 'jpeg' ? 'image/jpeg' : (img as any).output_format === 'webp' ? 'image/webp' : 'image/png',
        )
      }

      if (provider === 'nano-banana') {
        const img = await generateNanoBananaImage(description, body.nano_model ?? 'flash', body.aspect_ratio ?? '16:9')
        if ((img as any).error) {
          console.error(`[ImageService] Nano Banana generation failed: ${(img as any).error}`)
          throw new ValidationError(`Image generation failed: ${(img as any).error}`)
        }
        return uploadFromBase64(
          (img as any).b64_json,
          companyId,
          folder,
          (img as any).mimeType === 'image/jpeg' ? 'image/jpeg' : (img as any).mimeType === 'image/webp' ? 'image/webp' : 'image/png',
        )
      }

      if (provider === 'imagen') {
        const img = await generateImagenImage(description, body.aspect_ratio ?? '16:9', 1)
        if ((img as any).error) {
          console.error(`[ImageService] Imagen generation failed: ${(img as any).error}`)
          throw new ValidationError(`Image generation failed: ${(img as any).error}`)
        }
        return uploadFromBase64((img as any).b64_json, companyId, folder, 'image/png')
      }

      const img = await generateIdeogramImage(description, version, body.magic_prompt ?? true)
      if ((img as any).error) {
        console.error(`[ImageService] AI image generation failed: ${(img as any).error}`)
        throw new ValidationError(`Image generation failed: ${(img as any).error}`)
      }
      if ((img as any).url) return uploadFromUrl((img as any).url, companyId, folder)
      return null
    }

    const post = await imageRepository.findBlogPost(companyId, Number(body.post_id))
    if (!post) throw new NotFoundError('Not found.')

    let newUrl: string | null = null

    if (imageNumber === 1) {
      const cover = (post.cover_image as any) || {}
      const description = body.force_prompt || cover.description || ''

      newUrl = await generateAndUpload(description, 'covers')

      if (!newUrl) console.error('[ImageService] Storage upload returned null for cover image')
      if (newUrl) {
        cover.url = newUrl
        await imageRepository.updateBlogPostCover(post.id, cover)
      }
    } else {
      const imgs = post.elements.filter((e) => e.element_type === 'IMAGE')
      const idx = imageNumber - 2
      const target = imgs[idx]
      if (!target) throw new ValidationError(`No image element found at position ${imageNumber} (found ${imgs.length} image elements).`)
      const content = (target.content as any) || {}
      const description = body.force_prompt || content.description || ''

      newUrl = await generateAndUpload(description, 'elements')

      if (!newUrl) console.error('[ImageService] Storage upload returned null for element image')
      if (newUrl) {
        content.url = newUrl
        await imageRepository.updateElementContent(target.id, content)
      }
    }

    if (!newUrl) throw new ValidationError('Image was generated but could not be uploaded to storage.')

    return {
      status: `Successfully regenerated image ${imageNumber} for blog post: ${post.title_text}`,
      new_url: newUrl,
    }
  }

  async uploadImage(companyId: number, payload: unknown) {
    if (!(payload instanceof FormData)) throw new ValidationError('post_id and image are required.')

    const postId = Number(payload.get('post_id'))
    const imageNumber = Number(payload.get('image_number') ?? 1)
    const image = payload.get('image')
    if (!postId || !(image instanceof File)) throw new ValidationError('post_id and image are required.')

    const post = await imageRepository.findBlogPost(companyId, postId)
    if (!post) throw new NotFoundError('Not found.')

    let newUrl: string | null = null
    if (imageNumber === 1) {
      newUrl = await uploadFromBinary(image, companyId, 'covers')
      if (newUrl) {
        const cover = (post.cover_image as any) || {}
        cover.url = newUrl
        await imageRepository.updateBlogPostCover(post.id, cover)
      }
    } else {
      const imgs = post.elements.filter((e) => e.element_type === 'IMAGE')
      const target = imgs[imageNumber - 2]
      if (target) {
        newUrl = await uploadFromBinary(image, companyId, 'elements')
        if (newUrl) {
          const content = (target.content as any) || {}
          content.url = newUrl
          await imageRepository.updateElementContent(target.id, content)
        }
      }
    }

    if (!newUrl) throw new ValidationError('Invalid image number or image could not be uploaded.')

    return {
      status: `Successfully uploaded and replaced image ${imageNumber} for blog post: ${post.title_text}`,
      new_url: newUrl,
    }
  }

  async saveEditedImage(payload: unknown) {
    const body = typeof payload === 'string' ? JSON.parse(payload) : (payload ?? {}) as Record<string, unknown>
    const source = String((body as Record<string, unknown>).source ?? '')
    const versions = Array.isArray((body as Record<string, unknown>).versions)
      ? ((body as Record<string, unknown>).versions as Array<Record<string, unknown>>)
      : []
    const pngVersion = versions.find((version) => version.format === 'png')

    if (!pngVersion) throw new ValidationError('No PNG version found')
    if (!source) throw new ValidationError('Invalid JSON data')

    const fileName = source.split('/').pop() || 'edited-image.png'
    return {
      message: `Successfully saved ${fileName}`,
      script: `app.echoToOE('Saved: ${fileName}');`,
      newSource: source,
    }
  }

  async useStockPhoto(companyId: number, payload: unknown) {
    const body = payload as { post_id?: number; image_number?: number; image_url?: string }
    if (!body.post_id || !body.image_url) throw new ValidationError('post_id and image_url are required.')

    const post = await imageRepository.findBlogPost(companyId, Number(body.post_id))
    if (!post) throw new NotFoundError('Not found.')

    const imageNumber = Number(body.image_number ?? 1)

    if (imageNumber === 1) {
      const uploaded = await uploadFromUrl(body.image_url, companyId, 'covers')
      if (!uploaded) throw new ValidationError('Invalid image number or image could not be uploaded.')
      const cover = (post.cover_image as any) || {}
      cover.url = uploaded
      await imageRepository.updateBlogPostCover(post.id, cover)
      return {
        status: `Successfully uploaded and replaced image ${imageNumber} for blog post: ${post.title_text}`,
        new_url: uploaded,
      }
    }

    const imgs = post.elements.filter((e) => e.element_type === 'IMAGE')
    const target = imgs[imageNumber - 2]
    if (!target) throw new ValidationError('Invalid image number or image could not be uploaded.')

    const uploaded = await uploadFromUrl(body.image_url, companyId, 'elements')
    if (!uploaded) throw new ValidationError('Invalid image number or image could not be uploaded.')

    const content = (target.content as any) || {}
    content.url = uploaded
    await imageRepository.updateElementContent(target.id, content)

    return {
      status: `Successfully uploaded and replaced image ${imageNumber} for blog post: ${post.title_text}`,
      new_url: uploaded,
    }
  }

  async searchStockPhotos(
    _companyId: number,
    query: string,
    page = 1,
    perPage = 10,
    orientation?: 'landscape' | 'portrait' | 'square',
    color?: string,
  ) {
    if (!query) throw new ValidationError('Search query is required')
    const key = await vault.get('PEXELS')
    if (!key) throw new Error('Pexels API key is not set')

    const url = new URL('https://api.pexels.com/v1/search')
    url.searchParams.set('query', query)
    url.searchParams.set('page', String(page))
    url.searchParams.set('per_page', String(perPage))
    if (orientation) url.searchParams.set('orientation', orientation)
    if (color) url.searchParams.set('color', color)

    const res = await fetch(url, { headers: { Authorization: key } })
    if (!res.ok) throw new Error(`Error communicating with Pexels API: ${res.status}`)
    const data = (await res.json()) as any

    return {
      page: data.page,
      per_page: data.per_page,
      total_results: data.total_results,
      images: (data.photos ?? []).map((photo: any) => ({
        id: photo.id,
        width: photo.width,
        height: photo.height,
        url: photo.url,
        photographer: photo.photographer,
        photographer_url: photo.photographer_url,
        avg_color: photo.avg_color,
        src: {
          original: photo.src?.original,
          large: photo.src?.large,
          medium: photo.src?.medium,
          small: photo.src?.small,
          tiny: photo.src?.tiny,
        },
      })),
      ...(data.next_page ? { next_page: data.next_page } : {}),
      ...(data.prev_page ? { prev_page: data.prev_page } : {}),
    }
  }
}

export const imageService = new ImageService()
