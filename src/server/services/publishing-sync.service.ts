import { prisma } from '@/lib/prisma'
import { ValidationError } from '@/server/api/errors'
import { appendTaskLog, completeTask, createTask, failTask, setTaskRunning } from '@/server/tasks/runtime'
import { sendJsonWebhook } from '@/server/services/webhook-delivery.service'

export class PublishingSyncService {
  private async getCompanyPublishingConfig(companyId: number): Promise<{ api_endpoint: string; api_key: string | null }> {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { api_endpoint: true, api_key: true },
    })

    if (!company?.api_endpoint) {
      throw new ValidationError('Publishing endpoint is not configured')
    }

    return {
      api_endpoint: company.api_endpoint,
      api_key: company.api_key,
    }
  }

  async pushPost(companyId: number, postId: number) {
    const company = await this.getCompanyPublishingConfig(companyId)

    const post = await prisma.blogPost.findFirst({
      where: { id: postId, companyId },
      include: {
        categories: { select: { name: true } },
        elements: { orderBy: { order: 'asc' } },
      },
    })

    if (!post) {
      throw new ValidationError('Post not found')
    }

    const delivery = await sendJsonWebhook({
      endpoint: company.api_endpoint,
      apiKey: company.api_key,
      eventType: 'post.upsert',
      payload: {
        post: {
          id: post.id,
          title_text: post.title_text,
          slug: post.slug,
          seo_title: post.seo_title,
          focus_keyword: post.focus_keyword,
          excerpt: post.excerpt,
          meta_description: post.meta_description,
          cover_image: post.cover_image,
          status: post.status,
          categories: post.categories.map((c) => c.name),
        },
        processed_content: {
          id: post.id,
          elements: post.elements.map((el) => ({
            id: el.id,
            order: el.order,
            element_type: el.element_type.toLowerCase(),
            content: el.content,
          })),
        },
      },
    })

    if (!delivery.ok) {
      throw new ValidationError(`Push failed for post ${post.id}, HTTP ${delivery.status}`)
    }

    const existing = await prisma.blogPublish.findFirst({ where: { blogPostId: post.id } })
    if (existing) {
      await prisma.blogPublish.update({ where: { id: existing.id }, data: { remote_id: delivery.deliveryId } })
    } else {
      await prisma.blogPublish.create({ data: { blogPostId: post.id, remote_id: delivery.deliveryId } })
    }

    return {
      post_id: post.id,
      remote_id: delivery.deliveryId,
      endpoint_status: delivery.status,
      status: 'success' as const,
    }
  }

  async pushDictionary(companyId: number, dictionaryId: number) {
    const company = await this.getCompanyPublishingConfig(companyId)

    const dictionary = await prisma.dictionary.findFirst({
      where: { id: dictionaryId, companyId },
      include: {
        words: {
          include: { definition: true },
          orderBy: [{ letter: 'asc' }, { keyword: 'asc' }],
        },
      },
    })

    if (!dictionary) {
      throw new ValidationError('Dictionary not found')
    }

    const delivery = await sendJsonWebhook({
      endpoint: company.api_endpoint,
      apiKey: company.api_key,
      eventType: 'dictionary.upsert',
      payload: {
        dictionary: {
          id: dictionary.id,
          title: dictionary.title,
          subject: dictionary.subject,
          language: dictionary.language,
          status: dictionary.status,
          current_letter: dictionary.current_letter,
          num_words: dictionary.num_words,
        },
        terms: dictionary.words.map((w) => ({
          id: w.id,
          letter: w.letter,
          keyword: w.keyword,
          description: w.description,
          priority: w.priority,
          focus_keyword: w.focus_keyword,
          definition: w.definition
            ? {
                title: w.definition.title,
                featured_google_snippet: w.definition.featured_google_snippet,
                meta_description: w.definition.meta_description,
                seo_title: w.definition.seo_title,
                synonyms: w.definition.synonyms,
                antonyms: w.definition.antonyms,
                usage_examples: w.definition.usage_examples,
                related_keywords: w.definition.related_keywords,
                faqs: w.definition.faqs,
              }
            : null,
        })),
      },
    })

    if (!delivery.ok) {
      throw new ValidationError(`Push failed for dictionary ${dictionary.id}, HTTP ${delivery.status}`)
    }

    return {
      dictionary_id: dictionary.id,
      remote_id: delivery.deliveryId,
      endpoint_status: delivery.status,
      status: 'success' as const,
    }
  }

  async pushAllPosts(companyId: number) {
    const task = createTask()

    void (async () => {
      try {
        setTaskRunning(task.id, 'posts_push_all')

        const company = await this.getCompanyPublishingConfig(companyId)

        const posts = await prisma.blogPost.findMany({
          where: { companyId, status: 'GENERATED' },
          include: {
            categories: { select: { name: true } },
            elements: { orderBy: { order: 'asc' } },
          },
          orderBy: { id: 'asc' },
        })

        appendTaskLog(task.id, {
          stage: 'posts_push_all',
          type: 'planned',
          data: { count: posts.length },
        })

        for (const post of posts) {
          const delivery = await sendJsonWebhook({
            endpoint: company.api_endpoint,
            apiKey: company.api_key,
            eventType: 'post.upsert',
            payload: {
              post: {
                id: post.id,
                title_text: post.title_text,
                slug: post.slug,
                seo_title: post.seo_title,
                focus_keyword: post.focus_keyword,
                excerpt: post.excerpt,
                meta_description: post.meta_description,
                status: post.status,
                categories: post.categories.map((c) => c.name),
              },
              processed_content: {
                id: post.id,
                elements: post.elements.map((el) => ({
                  id: el.id,
                  order: el.order,
                  element_type: el.element_type.toLowerCase(),
                  content: el.content,
                })),
              },
            },
          })

          if (!delivery.ok) {
            throw new ValidationError(`Push failed for post ${post.id}, HTTP ${delivery.status}`)
          }

          const existing = await prisma.blogPublish.findFirst({ where: { blogPostId: post.id } })
          if (existing) {
            await prisma.blogPublish.update({ where: { id: existing.id }, data: { remote_id: delivery.deliveryId } })
          } else {
            await prisma.blogPublish.create({ data: { blogPostId: post.id, remote_id: delivery.deliveryId } })
          }

          appendTaskLog(task.id, {
            stage: 'posts_push_all',
            type: 'completed_item',
            data: { post_id: post.id, remote_id: delivery.deliveryId, http_status: delivery.status },
          })
        }

        completeTask(task.id, `Successfully pushed ${posts.length} posts`)
      } catch (error) {
        failTask(task.id, error instanceof Error ? error.message : String(error))
      }
    })()

    return { job_id: task.id, status: 'accepted' as const }
  }

  async pushAllDictionaries(companyId: number) {
    const task = createTask()

    void (async () => {
      try {
        setTaskRunning(task.id, 'dictionary_push_all')

        const company = await this.getCompanyPublishingConfig(companyId)

        const dictionaries = await prisma.dictionary.findMany({
          where: { companyId },
          include: {
            words: {
              include: { definition: true },
              orderBy: [{ letter: 'asc' }, { keyword: 'asc' }],
            },
          },
          orderBy: { id: 'asc' },
        })

        appendTaskLog(task.id, {
          stage: 'dictionary_push_all',
          type: 'planned',
          data: { count: dictionaries.length },
        })

        for (const dictionary of dictionaries) {
          const delivery = await sendJsonWebhook({
            endpoint: company.api_endpoint,
            apiKey: company.api_key,
            eventType: 'dictionary.upsert',
            payload: {
              dictionary: {
                id: dictionary.id,
                title: dictionary.title,
                subject: dictionary.subject,
                language: dictionary.language,
                status: dictionary.status,
                current_letter: dictionary.current_letter,
                num_words: dictionary.num_words,
              },
              terms: dictionary.words.map((w) => ({
                id: w.id,
                letter: w.letter,
                keyword: w.keyword,
                description: w.description,
                priority: w.priority,
                focus_keyword: w.focus_keyword,
                definition: w.definition
                  ? {
                      title: w.definition.title,
                      featured_google_snippet: w.definition.featured_google_snippet,
                      meta_description: w.definition.meta_description,
                      seo_title: w.definition.seo_title,
                      synonyms: w.definition.synonyms,
                      antonyms: w.definition.antonyms,
                      usage_examples: w.definition.usage_examples,
                      related_keywords: w.definition.related_keywords,
                      faqs: w.definition.faqs,
                    }
                  : null,
              })),
            },
          })

          if (!delivery.ok) {
            throw new ValidationError(`Push failed for dictionary ${dictionary.id}, HTTP ${delivery.status}`)
          }

          appendTaskLog(task.id, {
            stage: 'dictionary_push_all',
            type: 'completed_item',
            data: { dictionary_id: dictionary.id, remote_id: delivery.deliveryId, http_status: delivery.status },
          })
        }

        completeTask(task.id, `Successfully pushed ${dictionaries.length} dictionaries`)
      } catch (error) {
        failTask(task.id, error instanceof Error ? error.message : String(error))
      }
    })()

    return { job_id: task.id, status: 'accepted' as const }
  }
}

export const publishingSyncService = new PublishingSyncService()
