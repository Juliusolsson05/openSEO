import { NotFoundError, ValidationError } from '@/server/api/errors'
import { generateImage } from '@/server/ai/image/generate-image'
import * as imageRepository from '@/server/repositories/image.repository'

const DEFAULT_PLACEHOLDER_URL = 'https://res.cloudinary.com/dl9qdd24e/image/upload/v1732560659/600x400_fqbihy.png'

async function uploadBinaryToCloudinary(file: File, folder: string) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET
  if (!cloudName || !uploadPreset) return null

  const form = new FormData()
  form.set('file', file)
  form.set('upload_preset', uploadPreset)
  form.set('folder', folder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  })

  if (!res.ok) return null
  const data = (await res.json()) as { secure_url?: string }
  return data.secure_url ?? null
}

async function uploadUrlToCloudinary(imageUrl: string, folder: string) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET
  if (!cloudName || !uploadPreset) return null

  const body = new URLSearchParams({
    file: imageUrl,
    upload_preset: uploadPreset,
    folder,
  })

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!res.ok) return null
  const data = (await res.json()) as { secure_url?: string }
  return data.secure_url ?? null
}

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
      const img = await generateImage(coverDescription, coverVersion, body.magic_prompt ?? true)
      if ((img as any).url) {
        const cloudinaryUrl = await uploadUrlToCloudinary((img as any).url, 'blog_covers')
        if (cloudinaryUrl) coverImage.url = cloudinaryUrl
      }
    }

    await imageRepository.updateBlogPostCover(blogPost.id, coverImage)

    for (const element of blogPost.elements.filter((e) => e.element_type === 'IMAGE')) {
      const content = (element.content as any) || {}
      const description = content.description ?? ''
      if (forceUpdate || (content.url ?? '') === DEFAULT_PLACEHOLDER_URL) {
        const img = await generateImage(description, version, body.magic_prompt ?? true)
        if ((img as any).url) {
          const cloudinaryUrl = await uploadUrlToCloudinary((img as any).url, 'blog_covers')
          if (cloudinaryUrl) content.url = cloudinaryUrl
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
    const body = payload as { post_id?: number | string; image_number?: number | string; version?: number | string; magic_prompt?: boolean; force_prompt?: string }
    if (!body.post_id) throw new ValidationError('post_id is required.')
    if (body.image_number === undefined || body.image_number === null || body.image_number === '') {
      throw new ValidationError('image_number is required.')
    }

    const imageNumber = Number(body.image_number)
    if (!Number.isInteger(imageNumber)) throw new ValidationError('image_number must be an integer.')
    const version = Number(body.version ?? 1)
    if (!Number.isInteger(version)) throw new ValidationError('version must be an integer between 1 and 3.')
    if (![1, 2, 3].includes(version)) throw new ValidationError('Invalid version. Please select a version between 1 and 3.')

    const post = await imageRepository.findBlogPost(companyId, Number(body.post_id))
    if (!post) throw new NotFoundError('Not found.')

    let newUrl: string | null = null

    if (imageNumber === 1) {
      const cover = (post.cover_image as any) || {}
      const description = body.force_prompt || cover.description || ''
      const img = await generateImage(description, version, body.magic_prompt ?? true)
      if ((img as any).url) {
        newUrl = await uploadUrlToCloudinary((img as any).url, 'blog_covers')
      }
      if (newUrl) {
        cover.url = newUrl
        await imageRepository.updateBlogPostCover(post.id, cover)
      }
    } else {
      const imgs = post.elements.filter((e) => e.element_type === 'IMAGE')
      const idx = imageNumber - 2
      const target = imgs[idx]
      if (target) {
        const content = (target.content as any) || {}
        const description = body.force_prompt || content.description || ''
        const img = await generateImage(description, version, body.magic_prompt ?? true)
        if ((img as any).url) {
          newUrl = await uploadUrlToCloudinary((img as any).url, 'blog_elements')
        }
        if (newUrl) {
          content.url = newUrl
          await imageRepository.updateElementContent(target.id, content)
        }
      }
    }

    if (!newUrl) throw new ValidationError('Invalid image number or image could not be regenerated.')

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
      newUrl = await uploadBinaryToCloudinary(image, 'blog_covers')
      if (newUrl) {
        const cover = (post.cover_image as any) || {}
        cover.url = newUrl
        await imageRepository.updateBlogPostCover(post.id, cover)
      }
    } else {
      const imgs = post.elements.filter((e) => e.element_type === 'IMAGE')
      const target = imgs[imageNumber - 2]
      if (target) {
        newUrl = await uploadBinaryToCloudinary(image, 'blog_elements')
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

  async useStockPhoto(companyId: number, payload: unknown) {
    const body = payload as { post_id?: number; image_number?: number; image_url?: string }
    if (!body.post_id || !body.image_url) throw new ValidationError('post_id and image_url are required.')

    const post = await imageRepository.findBlogPost(companyId, Number(body.post_id))
    if (!post) throw new NotFoundError('Not found.')

    const imageNumber = Number(body.image_number ?? 1)

    if (imageNumber === 1) {
      const uploaded = await uploadUrlToCloudinary(body.image_url, 'blog_covers')
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

    const uploaded = await uploadUrlToCloudinary(body.image_url, 'blog_elements')
    if (!uploaded) throw new ValidationError('Invalid image number or image could not be uploaded.')

    const content = (target.content as any) || {}
    content.url = uploaded
    await imageRepository.updateElementContent(target.id, content)

    return {
      status: `Successfully uploaded and replaced image ${imageNumber} for blog post: ${post.title_text}`,
      new_url: uploaded,
    }
  }

  async searchStockPhotos(_companyId: number, query: string, page = 1, perPage = 10) {
    if (!query) throw new ValidationError('Search query is required')
    const key = process.env.PEXELS
    if (!key) throw new Error('Pexels API key is not set')

    const url = new URL('https://api.pexels.com/v1/search')
    url.searchParams.set('query', query)
    url.searchParams.set('page', String(page))
    url.searchParams.set('per_page', String(perPage))

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
