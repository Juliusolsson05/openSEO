import { createSlice, createAsyncThunk, type PayloadAction, createListenerMiddleware } from '@reduxjs/toolkit'
import type { Dispatch } from '@reduxjs/toolkit'
import { api } from '@/lib/api'
import {
  insertSkeletonLoader,
  removeSkeletonLoaders,
  removeSkeletonLoaderByOperationId,
  invalidatePost,
} from './blogUiSlice'
import type {
  AutopilotStage,
  AutopilotLog,
  AutopilotOperation,
  RecommendationSummary,
  ImprovementSummary,
  ImageSummary,
} from '@/types/autopilot'

interface AutopilotStartResponse {
  task_id: string
  status: string
}

// Serializable: use Record instead of Map
export interface AutopilotState {
  isRunning: boolean
  currentStage: AutopilotStage | string | null
  operations: Record<number, AutopilotOperation>
  lastLogTimestamp: string | null
  taskId: string | null
  postId: number | null
}

type AutopilotStore = { autopilot: AutopilotState }

const initialState: AutopilotState = {
  isRunning: false,
  currentStage: null,
  operations: {},
  lastLogTimestamp: null,
  taskId: null,
  postId: null,
}

let operationCounter = 1

// Async thunk: start the autopilot task
export const startAutopilot = createAsyncThunk<
  { taskId: string; postId: number },
  number,
  { rejectValue: string }
>('autopilot/start', async (postId, { rejectWithValue }) => {
  const { data, error } = await api<AutopilotStartResponse>(
    '/api/aurora/blog/quillo/post/autopilot/',
    { method: 'POST', body: JSON.stringify({ blog_post_id: postId }) }
  )

  if (error || !data?.task_id || data.status !== 'accepted') {
    return rejectWithValue(error?.message || 'Invalid response from autopilot')
  }

  return { taskId: data.task_id, postId }
})

export const autopilotSlice = createSlice({
  name: 'autopilot',
  initialState,
  reducers: {
    autopilotStopped(state) {
      state.isRunning = false
      state.operations = {}
      state.currentStage = null
      state.taskId = null
    },
    stageChanged(state, action: PayloadAction<string>) {
      state.currentStage = action.payload
    },
    operationsUpdated(state, action: PayloadAction<Record<number, AutopilotOperation>>) {
      state.operations = action.payload
    },
    timestampUpdated(state, action: PayloadAction<string>) {
      state.lastLogTimestamp = action.payload
    },
    resetAutopilot() {
      return { ...initialState }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startAutopilot.pending, (state) => {
        state.operations = {}
        state.lastLogTimestamp = null
        state.taskId = null
      })
      .addCase(startAutopilot.fulfilled, (state, action) => {
        state.taskId = action.payload.taskId
        state.postId = action.payload.postId
        state.isRunning = true
      })
      .addCase(startAutopilot.rejected, (state) => {
        state.isRunning = false
      })
  },
})

export const {
  autopilotStopped,
  stageChanged,
  operationsUpdated,
  timestampUpdated,
  resetAutopilot,
} = autopilotSlice.actions

// ---------------------------------------------------------------------------
// Thunk: stop autopilot (cleans up skeletons)
// ---------------------------------------------------------------------------

export const stopAutopilot = (postId?: number) => (dispatch: Dispatch, getState: () => AutopilotStore) => {
  const state = getState()
  const activePostId = postId ?? state.autopilot.postId
  if (activePostId) {
    dispatch(removeSkeletonLoaders(activePostId) as any)
  }
  dispatch(autopilotStopped())
}

// ---------------------------------------------------------------------------
// Listener Middleware — manages the polling loop
// ---------------------------------------------------------------------------

export const autopilotListener = createListenerMiddleware()

autopilotListener.startListening({
  actionCreator: startAutopilot.fulfilled,
  effect: async (action, listenerApi) => {
    const { postId, taskId } = action.payload
    listenerApi.cancelActiveListeners()

    // Poll every 1 second until stopped
    while (true) {
      await listenerApi.delay(1000)

      const state = listenerApi.getState() as AutopilotStore
      if (!state.autopilot.isRunning || !state.autopilot.taskId) break

      await fetchAndProcessLogs(
        listenerApi.dispatch as Dispatch,
        listenerApi.getState as () => AutopilotStore,
        taskId,
        postId
      )

      const newState = listenerApi.getState() as AutopilotStore
      if (!newState.autopilot.isRunning) break
    }
  },
})

// ---------------------------------------------------------------------------
// Log processing helpers (not Redux actions, just functions)
// ---------------------------------------------------------------------------

async function processLog(
  dispatch: Dispatch,
  getState: () => AutopilotStore,
  log: AutopilotLog,
  postId: number
): Promise<void> {
  const state = getState()
  const operations = { ...state.autopilot.operations }

  console.log(`[Autopilot] Processing log: stage=${log.stage}, type=${log.type}`)

  // Final completion
  if (
    log.stage === ('autopilot' as any) &&
    log.type === 'status' &&
    log.data.status === 'completed'
  ) {
    console.log('[Autopilot] Process completed')
    dispatch(removeSkeletonLoaders(postId) as any)
    dispatch(autopilotStopped())
    return
  }

  // Track current stage
  if (log.type === 'stage_started') {
    dispatch(stageChanged(log.stage))
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
      operations[-opId] = operation
      dispatch(insertSkeletonLoader(postId, opId, operation) as any)
    })
    dispatch(operationsUpdated(operations))
  }

  if (log.stage === 'element_creation' && log.type === ('finished' as any)) {
    dispatch(removeSkeletonLoaders(postId) as any)
    dispatch(invalidatePost(postId) as any)
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
      operations[-opId] = operation
      dispatch(insertSkeletonLoader(postId, opId, operation) as any)
    })
    dispatch(operationsUpdated(operations))
  }

  if (log.stage === ('paragraph_creation' as any) && log.type === ('finished' as any)) {
    dispatch(removeSkeletonLoaders(postId) as any)
    dispatch(invalidatePost(postId) as any)
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
      operations[imp.element_id] = operation
      dispatch(insertSkeletonLoader(postId, imp.element_id, operation) as any)
    })
    dispatch(operationsUpdated(operations))
  }

  if (log.stage === ('content_improvement' as any) && log.type === ('finished' as any)) {
    dispatch(removeSkeletonLoaders(postId) as any)
    dispatch(invalidatePost(postId) as any)
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
      operations[img.element_id] = operation
      dispatch(insertSkeletonLoader(postId, img.element_id, operation) as any)
    })
    dispatch(operationsUpdated(operations))
  }

  if (log.stage === 'image_generation' && log.type === 'completed') {
    const elementId = log.data.element_id
    if (elementId && operations[elementId]) {
      delete operations[elementId]
      dispatch(removeSkeletonLoaderByOperationId(postId, elementId) as any)
      dispatch(operationsUpdated(operations))
    }
  }

  if (log.stage === 'image_generation' && log.type === ('finished' as any)) {
    const imageOps = Object.entries(operations).filter(([, op]) => op.elementType === 'image')
    imageOps.forEach(([id]) => {
      const opId = Number(id)
      delete operations[opId]
      dispatch(removeSkeletonLoaderByOperationId(postId, opId) as any)
    })
    dispatch(operationsUpdated(operations))
    dispatch(invalidatePost(postId) as any)
  }
}

async function fetchAndProcessLogs(
  dispatch: Dispatch,
  getState: () => AutopilotStore,
  taskId: string,
  postId: number
) {
  const state = getState()
  const lastLogTimestamp = state.autopilot.lastLogTimestamp

  try {
    const { data, error } = await api<{ logs: AutopilotLog[]; status: string }>(
      `/api/aurora/blog/quillo/post/autopilot-status/${taskId}/`
    )

    if (error || !data?.logs) return

    const logs = data.logs
    const newLogs = lastLogTimestamp
      ? logs.filter((log) => new Date(log.timestamp) > new Date(lastLogTimestamp))
      : logs

    for (const log of newLogs) {
      await processLog(dispatch, getState, log, postId)
    }

    if (newLogs.length > 0 && logs.length > 0) {
      dispatch(timestampUpdated(logs[logs.length - 1].timestamp))
    }

    if (data.status === 'completed') {
      dispatch(removeSkeletonLoaders(postId) as any)
      dispatch(autopilotStopped())
    }
  } catch (error) {
    console.error('[Autopilot] Error fetching logs:', error)
    dispatch(removeSkeletonLoaders(postId) as any)
    dispatch(autopilotStopped())
  }
}
