'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { SigmaCampaign } from '@/types'

interface CampaignContextValue {
  campaigns: SigmaCampaign[]
  activeCampaignId: string // "all" or UUID
  activeCampaign: SigmaCampaign | null
  setCampaignId: (id: string) => void
  loading: boolean
  refresh: () => Promise<void>
}

const CampaignContext = createContext<CampaignContextValue | null>(null)

export function CampaignProvider({ children }: { children: React.ReactNode }) {
  const [campaigns, setCampaigns] = useState<SigmaCampaign[]>([])
  const [activeCampaignId, setActiveCampaignId] = useState('all')
  const [loading, setLoading] = useState(true)

  const fetchCampaigns = useCallback(async () => {
    try {
      const res = await fetch('/api/campaigns')
      if (res.ok) {
        const data = await res.json()
        setCampaigns(Array.isArray(data) ? data : data.campaigns ?? [])
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  const activeCampaign = activeCampaignId === 'all'
    ? null
    : campaigns.find(c => c.id === activeCampaignId) ?? null

  return (
    <CampaignContext.Provider
      value={{
        campaigns,
        activeCampaignId,
        activeCampaign,
        setCampaignId: setActiveCampaignId,
        loading,
        refresh: fetchCampaigns,
      }}
    >
      {children}
    </CampaignContext.Provider>
  )
}

export function useCampaignContext() {
  const ctx = useContext(CampaignContext)
  if (!ctx) throw new Error('useCampaignContext must be used within CampaignProvider')
  return ctx
}
