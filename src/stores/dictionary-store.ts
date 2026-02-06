/**
 * Dictionary store — ported from aurora_dashboard/stores/dictionary/dictionaryStore.ts
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, apiPost } from '@/lib/api'

interface Dictionary {
  id: number
  title: string
  subject: string
  language: string
  num_words: number
  current_letter: string
  status: string
  total_words?: number
}

interface Keyword {
  keyword: string
  description: string
  focus_keyword?: string
}

interface DictionaryState {
  currentDictionary: Dictionary | null
  sessionId: number | null
  removedKeywords: number[]
  currentLetterKeywords: Record<string, Keyword>
  isGenerating: boolean
  isInitialLoading: boolean
  error: Error | null
  dictionaries: Dictionary[]
  totalDictionaries: number

  fetchDictionaries: (params: {
    searchQuery: string
    itemsPerPage: number
    page: number
    sortBy?: string
    orderBy?: string
  }) => Promise<void>
  deleteDictionary: (dictionaryId: number) => Promise<void>
  startGeneration: (formData: {
    title: string
    subject: string
    language: string
    num_words: number
  }) => Promise<any>
  acceptCurrentLetterKeywords: () => Promise<any>
  rejectCurrentLetterKeywords: () => Promise<any>
  completeGeneration: () => Promise<any>
  addRemovedKeyword: (index: number) => void
  removeRemovedKeyword: (index: number) => void
  clearStore: () => void
}

export const useDictionaryStore = create<DictionaryState>()(
  persist(
    (set, get) => ({
      currentDictionary: null,
      sessionId: null,
      removedKeywords: [],
      currentLetterKeywords: {},
      isGenerating: false,
      isInitialLoading: true,
      error: null,
      dictionaries: [],
      totalDictionaries: 0,

      fetchDictionaries: async (params) => {
        set({ isGenerating: true, error: null })
        try {
          const { data, error } = await api<{
            dictionaries: Dictionary[]
            total: number
          }>('/api/aurora/dictionary/dictionaries', {
            params: {
              q: params.searchQuery,
              itemsPerPage: params.itemsPerPage,
              page: params.page,
              sortBy: params.sortBy,
              orderBy: params.orderBy,
            },
          })

          if (error) throw error

          if (data?.dictionaries) {
            set({
              dictionaries: data.dictionaries,
              totalDictionaries: data.total,
            })
          }
        } catch (e) {
          console.error('[DictionaryStore] Error fetching dictionaries:', e)
          set({ error: e as Error })
        } finally {
          set({ isGenerating: false, isInitialLoading: false })
        }
      },

      deleteDictionary: async (dictionaryId) => {
        try {
          const { error } = await apiPost(
            '/api/aurora/dictionary/dictionary/words/delete',
            { dictionary_id: dictionaryId }
          )
          if (error) throw error

          if (get().currentDictionary?.id === dictionaryId) {
            get().clearStore()
          }
        } catch (e) {
          console.error(`[DictionaryStore] Error deleting dictionary ${dictionaryId}:`, e)
          throw e
        }
      },

      startGeneration: async (formData) => {
        set({ isGenerating: true, error: null })
        try {
          const { data, error } = await apiPost<{
            session_id: number
            keywords: Record<string, Keyword>
          }>('/api/aurora/dictionary/generation/keywords/start/', formData)

          if (error) throw error

          if (data?.session_id && data.keywords) {
            set({
              sessionId: data.session_id,
              currentLetterKeywords: data.keywords,
              currentDictionary: {
                id: data.session_id,
                title: formData.title,
                subject: formData.subject,
                language: formData.language,
                num_words: formData.num_words,
                current_letter: 'a',
                status: 'generating',
              },
            })
          }
          return data
        } catch (e) {
          console.error('[DictionaryStore] Generation failed:', e)
          set({ error: e as Error })
          throw e
        } finally {
          set({ isGenerating: false })
        }
      },

      acceptCurrentLetterKeywords: async () => {
        const { sessionId, currentDictionary, removedKeywords } = get()
        if (!sessionId || !currentDictionary) return

        set({ isGenerating: true })
        try {
          const { data, error } = await apiPost<{
            letter?: string
            keywords?: Record<string, Keyword>
          }>('/api/aurora/dictionary/generation/keywords/review/', {
            session_id: sessionId,
            letter: currentDictionary.current_letter,
            accepted: true,
            removals: removedKeywords,
          })

          if (error) throw error

          if (data?.letter) {
            set({
              currentDictionary: {
                ...currentDictionary,
                current_letter: data.letter,
              },
              currentLetterKeywords: data.keywords ?? {},
              removedKeywords: [],
            })
          } else {
            await get().completeGeneration()
          }
          return data
        } catch (e) {
          console.error('[DictionaryStore] Failed to accept keywords:', e)
          set({ error: e as Error })
          throw e
        } finally {
          set({ isGenerating: false })
        }
      },

      rejectCurrentLetterKeywords: async () => {
        const { sessionId, currentDictionary } = get()
        if (!sessionId || !currentDictionary) return

        set({ isGenerating: true })
        try {
          const { data, error } = await apiPost<{
            keywords?: Record<string, Keyword>
          }>('/api/aurora/dictionary/generation/keywords/review/', {
            session_id: sessionId,
            letter: currentDictionary.current_letter,
            accepted: false,
          })

          if (error) throw error

          if (data?.keywords) {
            set({
              currentLetterKeywords: data.keywords,
              removedKeywords: [],
            })
          }
          return data
        } catch (e) {
          console.error('[DictionaryStore] Failed to reject keywords:', e)
          set({ error: e as Error })
          throw e
        } finally {
          set({ isGenerating: false })
        }
      },

      completeGeneration: async () => {
        const { sessionId } = get()
        if (!sessionId) return

        try {
          const { data, error } = await apiPost(
            '/api/aurora/dictionary/generation/keywords/end/',
            { session_id: sessionId }
          )
          if (error) throw error

          set({
            currentDictionary: null,
            sessionId: null,
            removedKeywords: [],
            currentLetterKeywords: {},
          })
          return data
        } catch (e) {
          console.error('[DictionaryStore] Failed to complete generation:', e)
          set({ error: e as Error })
          throw e
        }
      },

      addRemovedKeyword: (index) => {
        const { removedKeywords } = get()
        if (!removedKeywords.includes(index)) {
          set({ removedKeywords: [...removedKeywords, index] })
        }
      },

      removeRemovedKeyword: (index) => {
        set({
          removedKeywords: get().removedKeywords.filter((i) => i !== index),
        })
      },

      clearStore: () =>
        set({
          currentDictionary: null,
          sessionId: null,
          removedKeywords: [],
          currentLetterKeywords: {},
          isGenerating: false,
          isInitialLoading: false,
          error: null,
          dictionaries: [],
          totalDictionaries: 0,
        }),
    }),
    {
      name: 'dictionary-store',
      partialize: (state) => ({
        currentDictionary: state.currentDictionary,
        sessionId: state.sessionId,
        removedKeywords: state.removedKeywords,
        currentLetterKeywords: state.currentLetterKeywords,
        dictionaries: state.dictionaries,
        totalDictionaries: state.totalDictionaries,
      }),
    }
  )
)
