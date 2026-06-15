'use client'

import { useState, useEffect, useCallback } from 'react'
import { useCampaignContext } from '@/contexts/CampaignContext'
import KPICard from '@/components/dashboard/KPICard'
import type { OptinMetrics } from '@/types'

export default function OptinPage() {
  const { activeCampaignId } = useCampaignContext()
  const [metrics, setMetrics] = useState<OptinMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ days: '30' })
      if (activeCampaignId !== 'all') params.set('campaign_id', activeCampaignId)

      const res = await fetch(`/api/optin?${params}`)
      if (res.ok) {
        const data = await res.json()
        setMetrics(data)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [activeCampaignId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading || !metrics) {
    return (
      <div className="space-y-6">
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '24px',
            fontWeight: 600,
            color: '#F0EDE6',
            letterSpacing: '0.04em',
          }}
        >
          Opt-in
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse"
              style={{ backgroundColor: '#111111', border: '1px solid #1E1E1E', borderRadius: '2px' }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: '24px',
          fontWeight: 600,
          color: '#F0EDE6',
          letterSpacing: '0.04em',
        }}
      >
        Opt-in
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="Vues totales"
          value={metrics.views.toLocaleString('fr-FR')}
          color="#8A8580"
          subtitle="Sessions uniques"
          icon={<span className="text-sm">&#x1F441;</span>}
        />
        <KPICard
          title="Opt-ins totaux"
          value={metrics.optins.toLocaleString('fr-FR')}
          color="#C9A84C"
          subtitle="Emails uniques"
          icon={<span className="text-sm">&#x2714;</span>}
        />
        <KPICard
          title="Taux de conversion"
          value={`${metrics.rate}%`}
          color="#4A7A5A"
          subtitle="Opt-in / Vues"
          icon={<span className="text-sm">%</span>}
        />
      </div>

      {/* Visual conversion indicator */}
      <div className="card">
        <h3 className="label-upper mb-1">Entonnoir de conversion</h3>
        <div className="gold-rule mb-5" />
        <div className="flex items-end gap-6 justify-center h-48">
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-24 sm:w-32 transition-all duration-500"
              style={{
                height: '100%',
                backgroundColor: 'rgba(138, 133, 128, 0.15)',
                borderRadius: '2px 2px 0 0',
              }}
            />
            <span style={{ fontSize: '11px', color: '#8A8580', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Vues</span>
            <span
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '22px',
                fontWeight: 700,
                color: '#F0EDE6',
              }}
            >
              {metrics.views.toLocaleString('fr-FR')}
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-24 sm:w-32 transition-all duration-500"
              style={{
                height: metrics.views > 0
                  ? `${Math.max((metrics.optins / metrics.views) * 100, 5)}%`
                  : '5%',
                backgroundColor: 'rgba(201, 168, 76, 0.15)',
                borderRadius: '2px 2px 0 0',
              }}
            />
            <span style={{ fontSize: '11px', color: '#8A8580', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Opt-ins</span>
            <span
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '22px',
                fontWeight: 700,
                color: '#F0EDE6',
              }}
            >
              {metrics.optins.toLocaleString('fr-FR')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
