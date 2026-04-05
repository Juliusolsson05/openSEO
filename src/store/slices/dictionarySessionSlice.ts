import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { apiPost } from '@/lib/api'
import type { DashboardDictionary as Dictionary } from '@/types/dictionary'

interface Keyword {
  keyword: string
  description: string
  focus_keyword?: string
}

interface DictionarySessionState {
  currentDictionary: Dictionary | null
  sessionId: number | null
  removedKeywords: number[]
  currentLetterKeywords: Record<string, Keyword>
  isGenerating: boolean
  error: string | null
}

const initialState: DictionarySessionState = {
  currentDictionary: null,
  sessionId: null,
  removedKeywords: [],
  currentLetterKeywords: {},
  isGenerating: false,
  error: null,
}

export const startDictionaryGeneration = createAsyncThunk(
  'dictionarySession/startGeneration',
  async (formData: {
    title: string
    subject: string
    language: string
    num_words: number
  }, { rejectWithValue }) => {
    try {
      const data = await apiPost<{
        session_id: number
        keywords: Record<string, Keyword>
      }>('/api/aurora/dictionary/generation/keywords/start/', formData)

      if (!data?.session_id || !data.keywords) return rejectWithValue('Invalid response')
      return { data, formData }
    } catch (e: any) {
      return rejectWithValue(e?.message ?? 'Request failed')
    }
  }
)

export const acceptLetterKeywords = createAsyncThunk(
  'dictionarySession/acceptLetterKeywords',
  async (
    _arg: void,
    { getState, rejectWithValue }
  ) => {
    const state = (getState() as { dictionarySession: DictionarySessionState }).dictionarySession
    const { sessionId, currentDictionary, removedKeywords } = state
    if (!sessionId || !currentDictionary) return rejectWithValue('No active session')

    try {
      const data = await apiPost<{
        letter?: string
        keywords?: Record<string, Keyword>
      }>('/api/aurora/dictionary/generation/keywords/review/', {
        session_id: sessionId,
        letter: currentDictionary.current_letter,
        accepted: true,
        removals: removedKeywords,
      })
      return { data, currentDictionary }
    } catch (e: any) {
      return rejectWithValue(e?.message ?? 'Request failed')
    }
  }
)

export const rejectLetterKeywords = createAsyncThunk(
  'dictionarySession/rejectLetterKeywords',
  async (
    _arg: void,
    { getState, rejectWithValue }
  ) => {
    const state = (getState() as { dictionarySession: DictionarySessionState }).dictionarySession
    const { sessionId, currentDictionary } = state
    if (!sessionId || !currentDictionary) return rejectWithValue('No active session')

    try {
      const data = await apiPost<{
        keywords?: Record<string, Keyword>
      }>('/api/aurora/dictionary/generation/keywords/review/', {
        session_id: sessionId,
        letter: currentDictionary.current_letter,
        accepted: false,
      })
      return data
    } catch (e: any) {
      return rejectWithValue(e?.message ?? 'Request failed')
    }
  }
)

export const completeGeneration = createAsyncThunk(
  'dictionarySession/completeGeneration',
  async (
    _arg: void,
    { getState, rejectWithValue }
  ) => {
    const state = (getState() as { dictionarySession: DictionarySessionState }).dictionarySession
    const { sessionId } = state
    if (!sessionId) return rejectWithValue('No active session')

    try {
      await apiPost('/api/aurora/dictionary/generation/keywords/end/', {
        session_id: sessionId,
      })
      return null
    } catch (e: any) {
      return rejectWithValue(e?.message ?? 'Request failed')
    }
  }
)

export const dictionarySessionSlice = createSlice({
  name: 'dictionarySession',
  initialState,
  reducers: {
    addRemovedKeyword(state, action: PayloadAction<number>) {
      if (!state.removedKeywords.includes(action.payload)) {
        state.removedKeywords.push(action.payload)
      }
    },
    removeRemovedKeyword(state, action: PayloadAction<number>) {
      state.removedKeywords = state.removedKeywords.filter((i) => i !== action.payload)
    },
    clearSession(state) {
      state.currentDictionary = null
      state.sessionId = null
      state.removedKeywords = []
      state.currentLetterKeywords = {}
      state.isGenerating = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startDictionaryGeneration.pending, (state) => {
        state.isGenerating = true
        state.error = null
      })
      .addCase(startDictionaryGeneration.fulfilled, (state, action) => {
        state.isGenerating = false
        const { data, formData } = action.payload
        state.sessionId = data.session_id
        state.currentLetterKeywords = data.keywords
        state.currentDictionary = {
          id: data.session_id,
          title: formData.title,
          subject: formData.subject,
          language: formData.language,
          num_words: formData.num_words,
          current_letter: 'a',
          status: 'generating',
        }
      })
      .addCase(startDictionaryGeneration.rejected, (state, action) => {
        state.isGenerating = false
        state.error = action.payload as string
      })

    builder
      .addCase(acceptLetterKeywords.pending, (state) => {
        state.isGenerating = true
      })
      .addCase(acceptLetterKeywords.fulfilled, (state, action) => {
        state.isGenerating = false
        state.removedKeywords = []
        const { data, currentDictionary } = action.payload
        if (data?.letter) {
          state.currentDictionary = {
            ...currentDictionary,
            current_letter: data.letter,
          }
          state.currentLetterKeywords = data.keywords ?? {}
        } else {
          // No more letters — generation complete
          state.currentDictionary = null
          state.sessionId = null
          state.currentLetterKeywords = {}
        }
      })
      .addCase(acceptLetterKeywords.rejected, (state, action) => {
        state.isGenerating = false
        state.error = action.payload as string
      })

    builder
      .addCase(rejectLetterKeywords.pending, (state) => {
        state.isGenerating = true
      })
      .addCase(rejectLetterKeywords.fulfilled, (state, action) => {
        state.isGenerating = false
        state.removedKeywords = []
        if (action.payload?.keywords) {
          state.currentLetterKeywords = action.payload.keywords
        }
      })
      .addCase(rejectLetterKeywords.rejected, (state, action) => {
        state.isGenerating = false
        state.error = action.payload as string
      })

    builder
      .addCase(completeGeneration.fulfilled, (state) => {
        state.currentDictionary = null
        state.sessionId = null
        state.removedKeywords = []
        state.currentLetterKeywords = {}
      })
  },
})

export const { addRemovedKeyword, removeRemovedKeyword, clearSession } = dictionarySessionSlice.actions
