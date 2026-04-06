import { createSlice, createAsyncThunk, type PayloadAction, createListenerMiddleware } from '@reduxjs/toolkit'
import type { Dispatch } from '@reduxjs/toolkit'
import { api } from '@/lib/api'
import {
  insertSkeletonLoader,
  removeSkeletonLoaders,
  removeSkeletonLoaderByOperationId,
  invalidatePost,
  newOperationId,
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
  operations: Record<string, AutopilotOperation>
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

// Maps real element_id (Phase 3/4) or generated opId (Phase 1/2) to the
// skeleton operation id passed to insertSkeletonLoader / removeSkeletonLoaderByOperationId.
let pendingSkeletonIds: Record<string, string> = {}

export const startAutopilot = createAsyncThunk<
  { taskId: string; postId: number },
  number,
  { rejectValue: string }
>('autopilot/start', async (postId, { rejectWithValue }) => {
  try {
    const data = await api<AutopilotStartResponse>(
      '/api/aurora/blog/quillo/post/autopilot/',
      { method: 'POST', body: JSON.stringify({ blog_post_id: postId }) },
    )
    if (!data?.task_id || data.status !== 'accepted') {
      return rejectWithValue('Invalid response from autopilot')
    }
    return { taskId: data.task_id, postId }
  } catch (e: any) {
    return rejectWithValue(e?.message || 'Invalid response from autopilot')
  }
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
    operationsUpdated(state, action: PayloadAction<Record<string, AutopilotOperation>>) {
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
  pendingSkeletonIds = {}
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

  if (
    log.stage === ('autopilot' as any) &&
    log.type === 'status' &&
    log.data.status === 'completed'
  ) {
    dispatch(removeSkeletonLoaders(postId) as any)
    pendingSkeletonIds = {}
    dispatch(autopilotStopped())
    return
  }

  if (log.type === 'stage_started') {
    dispatch(stageChanged(log.stage))
  }

  // Phase 1: Element Generation
  if (log.stage === ('element_analysis' as any) && log.type === 'planned') {
    const recommendations = log.data.recommendations_summary as RecommendationSummary[]
    recommendations?.forEach((rec) => {
      const opId = newOperationId()
      const operation: AutopilotOperation = {
        type: 'new',
        status: 'planned',
        position: { afterElementId: rec.after_element_id },
        elementType: rec.element_type,
      }
      operations[opId] = operation
      pendingSkeletonIds[opId] = opId
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
      const opId = newOperationId()
      const operation: AutopilotOperation = {
        type: 'new',
        status: 'planned',
        position: { afterElementId: rec.after_element_id },
        elementType: 'paragraph',
      }
      operations[opId] = operation
      pendingSkeletonIds[opId] = opId
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
      operations[String(imp.element_id)] = operation
      const skeletonId = newOperationId()
      pendingSkeletonIds[String(imp.element_id)] = skeletonId
      dispatch(insertSkeletonLoader(postId, skeletonId, operation) as any)
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
      operations[String(img.element_id)] = operation
      const skeletonId = newOperationId()
      pendingSkeletonIds[String(img.element_id)] = skeletonId
      dispatch(insertSkeletonLoader(postId, skeletonId, operation) as any)
    })
    dispatch(operationsUpdated(operations))
  }

  if (log.stage === 'image_generation' && log.type === 'completed') {
    const elementId = log.data.element_id
    if (elementId && operations[String(elementId)]) {
      delete operations[String(elementId)]
      const skeletonId = pendingSkeletonIds[String(elementId)]
      if (skeletonId) {
        dispatch(removeSkeletonLoaderByOperationId(postId, skeletonId) as any)
        delete pendingSkeletonIds[String(elementId)]
      }
      dispatch(operationsUpdated(operations))
    }
  }

  if (log.stage === 'image_generation' && log.type === ('finished' as any)) {
    const imageOps = Object.entries(operations).filter(([, op]) => op.elementType === 'image')
    imageOps.forEach(([id]) => {
      delete operations[id]
      const skeletonId = pendingSkeletonIds[id]
      if (skeletonId) {
        dispatch(removeSkeletonLoaderByOperationId(postId, skeletonId) as any)
        delete pendingSkeletonIds[id]
      }
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
    const data = await api<{ logs: AutopilotLog[]; status: string }>(
      `/api/aurora/blog/quillo/post/autopilot-status/${taskId}/`,
    )

    if (!data?.logs) return

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
      pendingSkeletonIds = {}
      dispatch(autopilotStopped())
    }
  } catch (error) {
    console.error('[Autopilot] Error fetching logs:', error)
    dispatch(removeSkeletonLoaders(postId) as any)
    pendingSkeletonIds = {}
    dispatch(autopilotStopped())
  }
}
