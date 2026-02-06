/**
 * Autopilot store — ported from aurora_dashboard/stores/blog/autopilotStore.ts
 */

import { create } from 'zustand'
import { api } from '@/lib/api'
import { useBlogStore } from './blog-store'
import type {
  AutopilotStage,
  AutopilotLog,
  AutopilotOperation,
  RecommendationSummary,
  ImprovementSummary,
  ImageSummary,
} from './types'

interface AutopilotStartResponse {
  task_id: string
  status: string
}

interface AutopilotState {
  isRunning: boolean
  currentStage: AutopilotStage | string | null
  operations: Map<number, AutopilotOperation>
  pollingInterval: ReturnType<typeof setInterval> | null
  lastLogTimestamp: string | null
  taskId: string | null

  startAutopilot: (postId: number) => Promise<void>
  startPolling: () => void
  stopAutopilot: () => void
  fetchAndProcessLogs: () => Promise<void>
  processLog: (log: AutopilotLog) => Promise<void>
}

let operationCounter = 1

export const useAutopilotStore = create<AutopilotState>((set, get) => ({
  isRunning: false,
  currentStage: null,
  operations: new Map(),
  pollingInterval: null,
  lastLogTimestamp: null,
  taskId: null,

  startAutopilot: async (postId: number) => {
    console.log(`[Autopilot] Starting autopilot for post ID: ${postId}`)

    // Reset state
    set({
      operations: new Map(),
      lastLogTimestamp: null,
      taskId: null,
    })

    try {
      const { data, error } = await api<AutopilotStartResponse>(
        '/api/aurora/blog/quillo/post/autopilot/',
        {
          method: 'POST',
          body: JSON.stringify({ blog_post_id: postId }),
        }
      )

      if (error) throw error

      if (data?.task_id && data.status === 'accepted') {
        set({ taskId: data.task_id, isRunning: true })
        get().startPolling()
      } else {
        throw new Error('Invalid response from autopilot start')
      }
    } catch (error) {
      console.error('[Autopilot] Failed to start autopilot:', error)
      get().stopAutopilot()
      throw error
    }
  },

  startPolling: () => {
    const { taskId, pollingInterval: existing } = get()
    if (!taskId) {
      console.error('[Autopilot] Cannot start polling: No task ID')
      return
    }

    if (existing) clearInterval(existing)

    const interval = setInterval(async () => {
      await get().fetchAndProcessLogs()
    }, 1000)

    set({ pollingInterval: interval })
  },

  stopAutopilot: () => {
    console.log('[Autopilot] Stopping autopilot process')

    const { pollingInterval } = get()
    if (pollingInterval) clearInterval(pollingInterval)

    const blogStore = useBlogStore.getState()
    blogStore.removeSkeletonLoaders()

    set({
      isRunning: false,
      pollingInterval: null,
      operations: new Map(),
      currentStage: null,
      taskId: null,
    })
  },

  fetchAndProcessLogs: async () => {
    const { taskId, lastLogTimestamp } = get()
    if (!taskId) return

    try {
      const { data, error } = await api<{
        logs: AutopilotLog[]
        status: string
      }>(`/api/aurora/blog/quillo/post/autopilot-status/${taskId}/`)

      if (error || !data?.logs) return

      const logs = data.logs
      const newLogs = lastLogTimestamp
        ? logs.filter((log) => new Date(log.timestamp) > new Date(lastLogTimestamp))
        : logs

      for (const log of newLogs) {
        await get().processLog(log)
      }

      if (newLogs.length > 0) {
        set({ lastLogTimestamp: logs[logs.length - 1].timestamp })
      }

      if (data.status === 'completed') {
        get().stopAutopilot()
      }
    } catch (error) {
      console.error('[Autopilot] Error fetching logs:', error)
      get().stopAutopilot()
    }
  },

  processLog: async (log: AutopilotLog) => {
    console.log(`[Autopilot] Processing log: stage=${log.stage}, type=${log.type}`)
    const blogStore = useBlogStore.getState()
    const { operations } = get()

    // Final completion
    if (
      log.stage === ('autopilot' as any) &&
      log.type === 'status' &&
      log.data.status === 'completed'
    ) {
      console.log('[Autopilot] Process completed')
      get().stopAutopilot()
      return
    }

    // Track current stage
    if (log.type === 'stage_started') {
      set({ currentStage: log.stage })
      console.log(`[Autopilot] Stage started: ${log.stage}`)
    }

    // Phase 1: Element Generation
    if (log.stage === ('element_analysis' as any) && log.type === 'planned') {
      const recommendations = log.data.recommendations_summary as RecommendationSummary[]
      recommendations?.forEach((rec) => {
        const opId = operationCounter++
        const operation: AutopilotOperation = {
          elementId: -opId,
          type: 'new',
          status: 'planned',
          position: { afterElementId: rec.after_element_id },
          elementType: rec.element_type,
        }
        operations.set(-opId, operation)
        blogStore.insertSkeletonLoader(opId, operation)
      })
      set({ operations: new Map(operations) })
    }

    if (log.stage === 'element_creation' && log.type === ('finished' as any)) {
      blogStore.removeSkeletonLoaders()
      const post = useBlogStore.getState().post
      if (post) await blogStore.fetchPost(post.id, true)
    }

    // Phase 2: Paragraph Generation
    if (log.stage === ('paragraph_analysis' as any) && log.type === 'planned') {
      const recommendations = log.data.recommendations_summary as RecommendationSummary[]
      recommendations?.forEach((rec) => {
        const opId = operationCounter++
        const operation: AutopilotOperation = {
          elementId: -opId,
          type: 'new',
          status: 'planned',
          position: { afterElementId: rec.after_element_id },
          elementType: 'paragraph',
        }
        operations.set(-opId, operation)
        blogStore.insertSkeletonLoader(opId, operation)
      })
      set({ operations: new Map(operations) })
    }

    if (log.stage === ('paragraph_creation' as any) && log.type === ('finished' as any)) {
      blogStore.removeSkeletonLoaders()
      const post = useBlogStore.getState().post
      if (post) await blogStore.fetchPost(post.id, true)
    }

    // Phase 3: Content Improvement
    if (log.stage === 'content_improvement_analysis' && log.type === 'planned') {
      const improvements = log.data.improvements_summary as ImprovementSummary[]
      improvements?.forEach((imp) => {
        const operation: AutopilotOperation = {
          elementId: imp.element_id,
          type: 'enhancement',
          status: 'planned',
          elementType: imp.element_type,
          tools: imp.tools,
        }
        operations.set(imp.element_id, operation)
        blogStore.insertSkeletonLoader(imp.element_id, operation)
      })
      set({ operations: new Map(operations) })
    }

    if (log.stage === ('content_improvement' as any) && log.type === ('finished' as any)) {
      blogStore.removeSkeletonLoaders()
      const post = useBlogStore.getState().post
      if (post) await blogStore.fetchPost(post.id, true)
    }

    // Phase 4: Image Generation
    if (log.stage === 'image_analysis' && log.type === 'planned') {
      const imageSummary = (log.data.images_summary || []) as ImageSummary[]
      imageSummary.forEach((img) => {
        const operation: AutopilotOperation = {
          elementId: img.element_id,
          type: 'enhancement',
          status: 'planned',
          elementType: 'image',
        }
        operations.set(img.element_id, operation)
        blogStore.insertSkeletonLoader(img.element_id, operation)
      })
      set({ operations: new Map(operations) })
    }

    if (log.stage === 'image_generation' && log.type === 'completed') {
      const elementId = log.data.element_id
      if (elementId && operations.has(elementId)) {
        operations.delete(elementId)
        blogStore.removeSkeletonLoaderByOperationId(elementId)
        set({ operations: new Map(operations) })
      }
    }

    if (log.stage === 'image_generation' && log.type === ('finished' as any)) {
      const imageOps = Array.from(operations.entries()).filter(
        ([, op]) => op.elementType === 'image'
      )
      imageOps.forEach(([id]) => {
        operations.delete(id)
        blogStore.removeSkeletonLoaderByOperationId(id)
      })
      set({ operations: new Map(operations) })
      const post = useBlogStore.getState().post
      if (post) await blogStore.fetchPost(post.id, true)
    }
  },
}))
