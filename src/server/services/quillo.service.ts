import { prisma } from '@/lib/prisma'
import { NotFoundError, ValidationError } from '@/server/api/errors'
import { analyzeBlogPost } from '@/server/ai/quillo/analyze-blog-post'
import { continueChat } from '@/server/ai/quillo/continue-chat'
import { createFacebookPost } from '@/server/ai/quillo/create-facebook-post'
import { generateSeoAnalysis } from '@/server/ai/quillo/generate-seo-analysis'
import { elementService } from '@/server/services/element.service'
import * as quilloRepository from '@/server/repositories/quillo.repository'
import * as publishingRepository from '@/server/repositories/publishing.repository'
import { appendTaskLog, completeTask, createTask, failTask, setTaskRunning } from '@/server/tasks/runtime'
import { getElementSuggestions } from '@/server/ai/quillo/autopilot/get-element-suggestions'
import { getParagraphSuggestions } from '@/server/ai/quillo/autopilot/get-paragraph-suggestions'
import { getContentImprovements } from '@/server/ai/quillo/autopilot/get-content-improvements'
import { getImageSpecifications } from '@/server/ai/quillo/autopilot/get-image-specifications'
import { generateIdeogramImage } from '@/server/ai/image/generate-image'
import { uploadFromUrl } from '@/server/storage/upload'
import { toAiElementType } from '@/server/utils/element-type'

type QuilloMessage = {
  role: 'system' | 'user' | 'assistant'
  content: Array<{ type: 'text'; text: string }>
}

function parseJsonContent<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim()

  try {
    return JSON.parse(cleaned) as T
  } catch {
    return fallback
  }
}

async function getBlogPostSnapshot(companyId: number, blogPostId: number) {
  return prisma.blogPost.findFirst({
    where: { id: blogPostId, companyId },
    include: { elements: { orderBy: { order: 'asc' } } },
  })
}

function toAutopilotPayload(post: Awaited<ReturnType<typeof getBlogPostSnapshot>>) {
  if (!post) return null
  return {
    id: post.id,
    title_text: post.title_text,
    excerpt: post.excerpt,
    focus_keyword: post.focus_keyword,
    cover_image: post.cover_image,
    elements: post.elements.map((e) => ({
      id: e.id,
      order: e.order,
      element_type: toAiElementType(e.element_type),
      content: e.content,
    })),
  }
}

export class QuilloService {
  async analyzePost(companyId: number, postId: number) {
    const post = await quilloRepository.findBlogPost(companyId, postId)
    if (!post) throw new NotFoundError('Blog post not found')

    const { analysis_result, raw_response, messages } = await analyzeBlogPost(post)
    if (typeof analysis_result === 'object' && analysis_result && 'error' in analysis_result) {
      throw new ValidationError((analysis_result as { error: string }).error)
    }

    await quilloRepository.createBlogPostAnalysisLog({
      companyId,
      blogPostId: postId,
      analysis_data: analysis_result as any,
      openai_response_data: raw_response as any,
      messages: messages as any,
    })

    return analysis_result
  }

  async chat(companyId: number, payload: unknown) {
    const body = payload as { blog_post_id?: number; question?: string }
    if (!body.blog_post_id || !body.question) {
      throw new ValidationError('blog_post_id and question are required')
    }

    const post = await quilloRepository.findBlogPost(companyId, body.blog_post_id)
    if (!post) throw new NotFoundError('Blog post not found')

    const recent = await quilloRepository.findLatestBlogPostAnalysis(companyId, body.blog_post_id)
    if (!recent?.messages) throw new NotFoundError('No previous analysis found for this blog post.')

    const { new_analysis_result, raw_response, messages } = await continueChat(recent.messages as any, body.question)

    await quilloRepository.createBlogPostAnalysisLog({
      companyId,
      blogPostId: body.blog_post_id,
      analysis_data: new_analysis_result as any,
      openai_response_data: raw_response as any,
      messages: messages as any,
    })

    return new_analysis_result
  }

  async analyzeCompany(companyId: number) {
    const latestAnalytics = await quilloRepository.findLatestAnalytics(companyId)
    if (!latestAnalytics) throw new NotFoundError('No analytics log found for this company')

    const analysis = await generateSeoAnalysis(latestAnalytics.json_data)
    if (typeof analysis === 'object' && analysis && 'error' in analysis) {
      throw new ValidationError((analysis as { error: string }).error)
    }

    await quilloRepository.createCompanyAnalysisLog({
      companyId,
      analyticsLogId: latestAnalytics.id,
      analysis_data: analysis as any,
    })

    return analysis
  }

  async getCompanyAnalysis(companyId: number) {
    const latestAnalytics = await quilloRepository.findLatestAnalytics(companyId)
    if (!latestAnalytics) throw new NotFoundError('No analytics log found for this company')

    const latestAnalysis = await quilloRepository.findLatestCompanyAnalysis(companyId)
    if (latestAnalysis?.analytics_log?.json_data === latestAnalytics.json_data) {
      return { ...(latestAnalysis.analysis_data as object), is_new_analysis: false }
    }

    const analysis = await this.analyzeCompany(companyId)
    return { ...(analysis as object), is_new_analysis: true }
  }

  async runAutopilot(companyId: number, blogPostId: number) {
    const task = createTask()
    const taskId = task.id

    const asyncWork = async () => {
      try {
        setTaskRunning(taskId, 'autopilot')

        let post = await getBlogPostSnapshot(companyId, blogPostId)
        if (!post) {
          failTask(taskId, 'Blog post not found')
          return
        }

        appendTaskLog(taskId, {
          stage: 'autopilot',
          type: 'status',
          data: { status: 'started' },
        })

        appendTaskLog(taskId, {
          stage: 'autopilot',
          type: 'planned',
          data: {
            post_id: post.id,
            total_elements: post.elements.length,
          },
        })

        let messages: QuilloMessage[] = []

        // Phase 1: Element suggestions + creation
        const elementSuggestion = await getElementSuggestions(toAutopilotPayload(post))
        messages = elementSuggestion.messages as QuilloMessage[]
        const elementParsed = parseJsonContent<{ recommendations?: Array<{ element_type?: string; content_description?: string; location?: { after_element_id?: number } }> }>(
          elementSuggestion.response.choices[0]?.message.content,
          { recommendations: [] },
        )
        const elementRecs = Array.isArray(elementParsed.recommendations) ? elementParsed.recommendations : []

        appendTaskLog(taskId, {
          stage: 'element_analysis',
          type: 'planned',
          data: {
            num_recommendations: elementRecs.length,
            recommendations_summary: elementRecs
              .map((r) => ({
                element_type: String(r.element_type ?? ''),
                after_element_id: Number(r.location?.after_element_id ?? 0),
              }))
              .filter((r) => r.element_type && Number.isFinite(r.after_element_id) && r.after_element_id > 0),
          },
        })

        const elementErrors: Array<{ element_type?: string; error: string }> = []
        for (let idx = 0; idx < elementRecs.length; idx += 1) {
          const rec = elementRecs[idx]
          const elementType = String(rec.element_type ?? '')
          const afterElementId = Number(rec.location?.after_element_id ?? 0)
          const generationNote = String(rec.content_description ?? 'Improve content structure and flow')

          appendTaskLog(taskId, {
            stage: 'element_creation',
            type: 'in_progress',
            data: {
              index: idx,
              element_type: elementType,
              after_element_id: afterElementId,
            },
          })

          try {
            const created = await elementService.addGeneratedElement(companyId, {
              blogPostId,
              elementId: afterElementId,
              elementType,
              generationNote,
            })

            appendTaskLog(taskId, {
              stage: 'element_creation',
              type: 'completed',
              data: {
                index: idx,
                element_id: created.id,
                element_type: elementType,
              },
            })
          } catch (e) {
            const message = e instanceof Error ? e.message : String(e)
            elementErrors.push({ element_type: elementType, error: message })
            appendTaskLog(taskId, {
              stage: 'element_creation',
              type: 'completed',
              data: {
                index: idx,
                element_type: elementType,
                error: message,
              },
            })
          }
        }

        appendTaskLog(taskId, {
          stage: 'element_creation',
          type: 'finished',
          data: {
            errors: elementErrors,
          },
        })

        post = await getBlogPostSnapshot(companyId, blogPostId)
        if (!post) throw new NotFoundError('Blog post not found after element creation')

        // Phase 2: Paragraph suggestions + creation
        const paragraphSuggestion = await getParagraphSuggestions(toAutopilotPayload(post), messages)
        messages = paragraphSuggestion.messages as QuilloMessage[]
        const paragraphParsed = parseJsonContent<{ recommendations?: Array<{ element_type?: string; content_description?: string; location?: { after_element_id?: number } }> }>(
          paragraphSuggestion.response.choices[0]?.message.content,
          { recommendations: [] },
        )
        const paragraphRecs = Array.isArray(paragraphParsed.recommendations) ? paragraphParsed.recommendations : []

        appendTaskLog(taskId, {
          stage: 'paragraph_analysis',
          type: 'planned',
          data: {
            num_recommendations: paragraphRecs.length,
            recommendations_summary: paragraphRecs
              .map((r) => ({
                element_type: String(r.element_type ?? ''),
                after_element_id: Number(r.location?.after_element_id ?? 0),
              }))
              .filter((r) => r.element_type && Number.isFinite(r.after_element_id) && r.after_element_id > 0),
          },
        })

        const paragraphErrors: Array<{ element_type?: string; error: string }> = []
        for (let idx = 0; idx < paragraphRecs.length; idx += 1) {
          const rec = paragraphRecs[idx]
          const elementType = String(rec.element_type ?? 'paragraph')
          const afterElementId = Number(rec.location?.after_element_id ?? 0)
          const generationNote = String(rec.content_description ?? 'Add contextual paragraph to improve reading flow')

          appendTaskLog(taskId, {
            stage: 'paragraph_creation',
            type: 'in_progress',
            data: {
              index: idx,
              element_type: elementType,
              after_element_id: afterElementId,
            },
          })

          try {
            const created = await elementService.addGeneratedElement(companyId, {
              blogPostId,
              elementId: afterElementId,
              elementType,
              generationNote,
            })

            appendTaskLog(taskId, {
              stage: 'paragraph_creation',
              type: 'completed',
              data: {
                index: idx,
                element_id: created.id,
                element_type: elementType,
              },
            })
          } catch (e) {
            const message = e instanceof Error ? e.message : String(e)
            paragraphErrors.push({ element_type: elementType, error: message })
            appendTaskLog(taskId, {
              stage: 'paragraph_creation',
              type: 'completed',
              data: {
                index: idx,
                element_type: elementType,
                error: message,
              },
            })
          }
        }

        appendTaskLog(taskId, {
          stage: 'paragraph_creation',
          type: 'finished',
          data: {
            errors: paragraphErrors,
          },
        })

        post = await getBlogPostSnapshot(companyId, blogPostId)
        if (!post) throw new NotFoundError('Blog post not found after paragraph creation')

        // Phase 3: Content improvements
        const improvementsResponse = await getContentImprovements(toAutopilotPayload(post), messages)
        messages = improvementsResponse.messages as QuilloMessage[]
        const improvementsParsed = parseJsonContent<{
          element_improvements?: Array<{
            element_id?: number
            element_type?: string
            tools?: Array<{ tool_name?: string; application_order?: number }>
          }>
        }>(improvementsResponse.response.choices[0]?.message.content, { element_improvements: [] })
        const improvements = Array.isArray(improvementsParsed.element_improvements)
          ? improvementsParsed.element_improvements
          : []

        appendTaskLog(taskId, {
          stage: 'content_improvement_analysis',
          type: 'planned',
          data: {
            num_improvements: improvements.length,
            improvements_summary: improvements.map((imp) => ({
              element_id: Number(imp.element_id ?? 0),
              element_type: String(imp.element_type ?? ''),
              tools: (imp.tools ?? []).map((t) => String(t.tool_name ?? '')),
            })),
          },
        })

        const improvementErrors: Array<{ element_id?: number; error: string }> = []
        for (let idx = 0; idx < improvements.length; idx += 1) {
          const imp = improvements[idx]
          const elementId = Number(imp.element_id ?? 0)
          const elementType = String(imp.element_type ?? '')
          const tools = [...(imp.tools ?? [])].sort(
            (a, b) => Number(a.application_order ?? 0) - Number(b.application_order ?? 0),
          )

          appendTaskLog(taskId, {
            stage: 'content_improvement',
            type: 'in_progress',
            data: { index: idx, element_id: elementId, element_type: elementType },
          })

          const appliedTools: string[] = []
          try {
            for (const tool of tools) {
              const toolName = String(tool.tool_name ?? '')
              if (!elementId || !toolName) continue

              if (toolName === 'enhance') {
                await elementService.enhanceElementByContext(companyId, blogPostId, elementId)
                appliedTools.push('enhance')
              } else if (toolName === 'regenerate') {
                await elementService.regenerateElementByContext(companyId, {
                  blogPostId,
                  blogElementId: elementId,
                  regenerationNote: 'Improve the content while maintaining the core message.',
                  newElementType: null,
                  newElementCount: 1,
                })
                appliedTools.push('regenerate')
              } else if (toolName === 'humanize') {
                await elementService.humanizeElementByContext(companyId, blogPostId, elementId)
                appliedTools.push('humanize')
              }
            }
          } catch (e) {
            const message = e instanceof Error ? e.message : String(e)
            improvementErrors.push({ element_id: elementId || undefined, error: message })
          }

          appendTaskLog(taskId, {
            stage: 'content_improvement',
            type: 'completed',
            data: {
              index: idx,
              element_id: elementId,
              element_type: elementType,
              applied_tools: appliedTools,
            },
          })
        }

        appendTaskLog(taskId, {
          stage: 'content_improvement',
          type: 'finished',
          data: {
            errors: improvementErrors,
          },
        })

        post = await getBlogPostSnapshot(companyId, blogPostId)
        if (!post) throw new NotFoundError('Blog post not found after content improvement')

        // Phase 4: Image specifications + generation
        const imageSpecResponse = await getImageSpecifications(toAutopilotPayload(post), messages)
        const imageSpecParsed = parseJsonContent<{
          style_guide?: string
          images?: Array<{ element_id?: number; description?: string; alt_text?: string }>
        }>(imageSpecResponse.response.choices[0]?.message.content, { style_guide: '', images: [] })

        const styleGuide = String(imageSpecParsed.style_guide ?? '')
        const imageSpecs = Array.isArray(imageSpecParsed.images) ? imageSpecParsed.images : []

        appendTaskLog(taskId, {
          stage: 'image_analysis',
          type: 'planned',
          data: {
            style_guide_brief: styleGuide,
            num_images: imageSpecs.length,
            images_summary: imageSpecs
              .map((img) => ({ element_id: Number(img.element_id ?? 0) }))
              .filter((img) => Number.isFinite(img.element_id) && img.element_id > 0),
          },
        })

        const imageErrors: Array<{ element_id?: number; error: string }> = []
        for (let idx = 0; idx < imageSpecs.length; idx += 1) {
          const spec = imageSpecs[idx]
          const elementId = Number(spec.element_id ?? 0)
          const description = String(spec.description ?? '')

          appendTaskLog(taskId, {
            stage: 'image_generation',
            type: 'in_progress',
            data: { index: idx, element_id: elementId },
          })

          try {
            if (!elementId) throw new ValidationError('Invalid element_id in image specification')

            const element = await prisma.blogPostElement.findFirst({ where: { id: elementId, blogPostId } })
            if (!element) throw new NotFoundError('Element not found for image generation')
            if (toAiElementType(element.element_type) !== 'image') {
              throw new ValidationError('Target element is not an image element')
            }

            const prompt = styleGuide ? `${description} Style: ${styleGuide}` : description
            const generated = await generateIdeogramImage(prompt, 2, true)
            const sourceUrl = (generated as any)?.url as string | undefined
            if (!sourceUrl) throw new ValidationError('Image generation did not return a URL')

            const uploaded = await uploadFromUrl(sourceUrl, companyId, 'elements')
            if (!uploaded) throw new ValidationError('Image upload failed')

            const content = ((element.content ?? {}) as Record<string, unknown>)
            content.url = uploaded
            content.description = description
            if (spec.alt_text) content.alt_text = spec.alt_text

            await prisma.blogPostElement.update({
              where: { id: element.id },
              data: { content: content as any },
            })

            appendTaskLog(taskId, {
              stage: 'image_generation',
              type: 'completed',
              data: { index: idx, element_id: element.id, url: uploaded },
            })
          } catch (e) {
            const message = e instanceof Error ? e.message : String(e)
            imageErrors.push({ element_id: elementId || undefined, error: message })
            appendTaskLog(taskId, {
              stage: 'image_generation',
              type: 'completed',
              data: { index: idx, element_id: elementId, error: message },
            })
          }
        }

        appendTaskLog(taskId, {
          stage: 'image_generation',
          type: 'finished',
          data: {
            errors: imageErrors,
          },
        })

        appendTaskLog(taskId, {
          stage: 'autopilot',
          type: 'status',
          data: { status: 'completed' },
        })

        completeTask(taskId, 'Autopilot enhancement complete.')
      } catch (e) {
        console.error('[Autopilot] Error:', e)
        failTask(taskId, e instanceof Error ? e.message : String(e))
      }
    }

    void asyncWork()
    return { task_id: taskId, status: 'accepted' as const }
  }

  async generateFacebookPost(companyId: number, postId: number) {
    const post = await quilloRepository.findBlogPost(companyId, postId)
    if (!post) throw new NotFoundError('Blog post not found')

    const company = await publishingRepository.findCompany(companyId)
    const elements = JSON.stringify(post.elements.map((e) => e.content))
    const generated = await createFacebookPost({
      elements,
      slug: post.slug,
      companyUrl: company?.website_url ?? null,
    })
    return { facebook_post: generated }
  }
}

export const quilloService = new QuilloService()
