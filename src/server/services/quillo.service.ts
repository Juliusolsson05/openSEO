import { prisma } from '@/lib/prisma'
import { NotFoundError, ValidationError } from '@/server/api/errors'
import { analyzeBlogPost } from '@/server/ai/quillo/analyze-blog-post'
import { continueChat } from '@/server/ai/quillo/continue-chat'
import { createFacebookPost } from '@/server/ai/quillo/create-facebook-post'
import { generateSeoAnalysis } from '@/server/ai/quillo/generate-seo-analysis'
import { elementService } from '@/server/services/element.service'
import * as quilloRepository from '@/server/repositories/quillo.repository'
import { appendTaskLog, completeTask, createTask, failTask, setTaskRunning } from '@/server/tasks/runtime'

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

        const post = await prisma.blogPost.findFirst({
          where: { id: blogPostId, companyId },
          include: { elements: { orderBy: { order: 'asc' } } },
        })

        if (!post) {
          failTask(taskId, 'Blog post not found')
          return
        }

        appendTaskLog(taskId, {
          stage: 'autopilot',
          type: 'planned',
          data: {
            post_id: post.id,
            total_elements: post.elements.length,
          },
        })

        for (const el of post.elements) {
          const type = el.element_type.toLowerCase()
          if (!['paragraph', 'introduction', 'conclusion', 'list_paragraph'].includes(type)) {
            continue
          }

          appendTaskLog(taskId, {
            stage: 'content_improvement',
            type: 'started',
            data: { element_id: el.id, element_type: type },
          })

          try {
            await elementService.humanizeElementByContext(companyId, blogPostId, el.id)
            appendTaskLog(taskId, {
              stage: 'content_improvement',
              type: 'completed',
              data: { element_id: el.id, element_type: type },
            })
          } catch (e) {
            const message = e instanceof Error ? e.message : String(e)
            appendTaskLog(taskId, {
              stage: 'content_improvement',
              type: 'error',
              data: { element_id: el.id, element_type: type, error: message },
            })
            console.error(`[Autopilot] Failed to improve element ${el.id}:`, e)
          }
        }

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

    const elements = JSON.stringify(post.elements.map((e) => e.content))
    const generated = await createFacebookPost(elements, post.slug)
    return { facebook_post: generated }
  }
}

export const quilloService = new QuilloService()
