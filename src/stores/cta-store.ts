/**
 * CTA store — ported from aurora_dashboard/stores/cta/ctaStore.ts
 */

import { create } from 'zustand'
import { api, apiPost, apiPut, apiDelete, apiPostForm } from '@/lib/api'

interface CTA {
  id: number
  title: string
  description: string
  image: string
  link: string
}

interface Campaign {
  id: number
  name: string
  ctas: CTA[]
}

interface CtaState {
  campaigns: Campaign[]
  isLoading: boolean
  errorMessage: string | null
  successMessage: string | null

  fetchCTAs: () => Promise<void>
  createNewCampaign: (name: string) => Promise<void>
  editCampaign: (campaignId: number, name: string) => Promise<void>
  deleteCampaign: (campaignId: number) => Promise<void>
  createNewCTA: (payload: {
    campaignId: number
    title: string
    description: string
    link: string
    generateImage: boolean
    image: File | null
  }) => Promise<void>
  editCTA: (
    ctaId: number,
    payload: {
      title: string
      description: string
      link: string
      generateImage: boolean
      image: File | null
    }
  ) => Promise<void>
  deleteCTA: (ctaId: number) => Promise<void>
  clearMessages: () => void
}

const ensureLeadingSlash = (link: string): string =>
  link.startsWith('/') ? link : `/${link}`

export const useCtaStore = create<CtaState>((set, get) => ({
  campaigns: [],
  isLoading: false,
  errorMessage: null,
  successMessage: null,

  clearMessages: () => set({ errorMessage: null, successMessage: null }),

  fetchCTAs: async () => {
    set({ isLoading: true, errorMessage: null })
    try {
      const { data, error } = await api<any[]>('/api/aurora/blog/cta/list/')
      if (error) throw error

      const campaigns: Campaign[] = (data ?? []).map((campaign: any) => ({
        id: campaign.id,
        name: campaign.name,
        ctas: (campaign.ctas ?? []).map((cta: any) => ({
          id: cta.id,
          title: cta.title,
          description: cta.description,
          image: cta.image_url ?? cta.image ?? '',
          link: cta.link,
        })),
      }))

      set({ campaigns, isLoading: false })
    } catch (e: any) {
      console.error('Error fetching CTAs:', e)
      set({
        errorMessage: 'Failed to fetch CTAs.',
        isLoading: false,
      })
    }
  },

  createNewCampaign: async (name: string) => {
    if (!name.trim()) {
      set({ errorMessage: 'Campaign name is required.' })
      return
    }
    set({ isLoading: true, errorMessage: null })
    try {
      const { error } = await apiPost('/api/aurora/blog/cta/campaign/create/', { name })
      if (error) throw error
      await get().fetchCTAs()
      set({ successMessage: 'Campaign created successfully.', isLoading: false })
    } catch (e: any) {
      set({ errorMessage: e.message || 'Failed to create campaign.', isLoading: false })
    }
  },

  editCampaign: async (campaignId, name) => {
    if (!name.trim()) {
      set({ errorMessage: 'Campaign name is required.' })
      return
    }
    set({ isLoading: true, errorMessage: null })
    try {
      const { error } = await apiPut(
        `/api/aurora/blog/cta/campaign/edit/${campaignId}/`,
        { name }
      )
      if (error) throw error
      await get().fetchCTAs()
      set({ successMessage: 'Campaign updated successfully.', isLoading: false })
    } catch (e: any) {
      set({ errorMessage: e.message || 'Failed to update campaign.', isLoading: false })
    }
  },

  deleteCampaign: async (campaignId) => {
    set({ isLoading: true, errorMessage: null })
    try {
      const { error } = await apiDelete(
        `/api/aurora/blog/cta/campaign/delete/${campaignId}/`
      )
      if (error) throw error
      await get().fetchCTAs()
      set({ successMessage: 'Campaign deleted successfully.', isLoading: false })
    } catch (e: any) {
      set({ errorMessage: e.message || 'Failed to delete campaign.', isLoading: false })
    }
  },

  createNewCTA: async (payload) => {
    const { campaignId, title, description, link, generateImage, image } = payload

    if (!title.trim() || !description.trim() || !link.trim()) {
      set({ errorMessage: 'Please fill in all required fields.' })
      return
    }
    if (!generateImage && !image) {
      set({ errorMessage: 'Please upload an image or enable "Generate Image".' })
      return
    }

    set({ isLoading: true, errorMessage: null })
    try {
      const formData = new FormData()
      formData.append('campaign_id', String(campaignId))
      formData.append('title', title.trim())
      formData.append('description', description.trim())
      formData.append('link', ensureLeadingSlash(link.trim()))
      if (!generateImage && image) formData.append('image', image)
      formData.append('generate_image', String(generateImage))

      await apiPostForm('/api/aurora/blog/cta/create/', formData)
      await get().fetchCTAs()
      set({ successMessage: 'CTA created successfully.', isLoading: false })
    } catch (e: any) {
      set({ errorMessage: e.message || 'Failed to create CTA.', isLoading: false })
    }
  },

  editCTA: async (ctaId, payload) => {
    const { title, description, link, generateImage, image } = payload

    if (!title.trim() || !description.trim() || !link.trim()) {
      set({ errorMessage: 'Please fill in all required fields.' })
      return
    }

    set({ isLoading: true, errorMessage: null })
    try {
      const formData = new FormData()
      formData.append('title', title.trim())
      formData.append('description', description.trim())
      formData.append('link', ensureLeadingSlash(link.trim()))
      if (!generateImage && image) formData.append('image', image)
      formData.append('generate_image', String(generateImage))

      // apiPostForm uses POST — the backend edit endpoint uses PUT with FormData
      // We need a raw fetch for PUT + FormData
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || ''
      const { getCookie } = await import('cookies-next')
      const companyId =
        typeof window !== 'undefined' ? getCookie('companyId') : null

      const res = await fetch(
        `${baseUrl}/api/aurora/blog/cta/edit/${ctaId}/`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            ...(companyId ? { 'Company-ID': String(companyId) } : {}),
          },
          body: formData,
        }
      )
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.detail || `HTTP ${res.status}`)
      }

      await get().fetchCTAs()
      set({ successMessage: 'CTA updated successfully.', isLoading: false })
    } catch (e: any) {
      set({ errorMessage: e.message || 'Failed to update CTA.', isLoading: false })
    }
  },

  deleteCTA: async (ctaId) => {
    set({ isLoading: true, errorMessage: null })
    try {
      const { error } = await apiDelete(`/api/aurora/blog/cta/delete/${ctaId}/`)
      if (error) throw error
      await get().fetchCTAs()
      set({ successMessage: 'CTA deleted successfully.', isLoading: false })
    } catch (e: any) {
      set({ errorMessage: e.message || 'Failed to delete CTA.', isLoading: false })
    }
  },
}))
