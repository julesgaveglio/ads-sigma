'use client'

import { useState, useEffect, useCallback } from 'react'
import { useCampaignContext } from '@/contexts/CampaignContext'
import KPICard from '@/components/dashboard/KPICard'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { FunnelMetrics } from '@/types'

const FUNNEL_STEPS = [
  { key: 'page_view', label: 'Page vue' },
  { key: 'optin', label: 'Opt-in' },
  { key: 'vsl_view', label: 'VSL vue' },
  { key: 'vsl_25', label: 'VSL 25%' },
  { key: 'vsl_50', label: 'VSL 50%' },
  { key: 'vsl_75', label: 'VSL 75%' },
  { key: 'vsl_100', label: 'VSL 100%' },
  { key: 'booking_start', label: 'RDV commence' },
  { key: 'booking_confirmed', label: 'RDV confirme' },
] as const

function funnelColor(index: number, total: number): string {
  // Gradient from gold (#C9A84C) to success (#4A7A5A)
  const goldR = 201, goldG = 168, goldB = 76
  const successR = 74, successG = 122, successB = 90
  const t = total > 1 ? index / (total - 1) : 0
  const r = Math.round(goldR + (successR - goldR) * t)
  const g = Math.round(goldG + (successG - goldG) * t)
  const b = Math.round(goldB + (successB - goldB) * t)
  return `rgb(${r},${g},${b})`
}

export default function AdsDashboard() {
  const { activeCampaignId } = useCampaignContext()
  const [metrics, setMetrics] = useState<FunnelMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ days: '30' })
      if (activeCampaignId !== 'all') params.set('campaign_id', activeCampaignId)

      const res = await fetch(`/api/funnel?${params}`)
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
          Dashboard
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse"
              style={{ backgroundColor: '#111111', border: '1px solid #1E1E1E', borderRadius: '2px' }}
            />
          ))}
        </div>
        <div
          className="h-80 animate-pulse"
          style={{ backgroundColor: '#111111', border: '1px solid #1E1E1E', borderRadius: '2px' }}
        />
      </div>
    )
  }

  const { funnel, daily, sources } = metrics
  const maxFunnel = Math.max(...FUNNEL_STEPS.map((s) => funnel[s.key] || 0), 1)

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
        Dashboard
      </h2>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Vues"
          value={funnel.page_view?.toLocaleString('fr-FR') ?? 0}
          color="#8A8580"
          subtitle="30 derniers jours"
          icon={<span className="text-sm">&#x1F441;</span>}
        />
        <KPICard
          title="Opt-ins"
          value={funnel.optin?.toLocaleString('fr-FR') ?? 0}
          color="#C9A84C"
          subtitle="30 derniers jours"
          icon={<span className="text-sm">&#x2714;</span>}
        />
        <KPICard
          title="Taux de conversion"
          value={
            funnel.page_view
              ? `${((funnel.optin / funnel.page_view) * 100).toFixed(1)}%`
              : '0%'
          }
          color="#4A7A5A"
          icon={<span className="text-sm">%</span>}
        />
        <KPICard
          title="RDV confirmes"
          value={funnel.booking_confirmed?.toLocaleString('fr-FR') ?? 0}
          color="#C9A84C"
          subtitle="30 derniers jours"
          icon={<span className="text-sm">&#x1F4C5;</span>}
        />
      </div>

      {/* Funnel visualization */}
      <div className="card">
        <h3 className="label-upper mb-1">Funnel complet</h3>
        <div className="gold-rule mb-5" />
        <div className="space-y-3">
          {FUNNEL_STEPS.map((step, i) => {
            const count = funnel[step.key] || 0
            const width = Math.max((count / maxFunnel) * 100, 2)
            const color = funnelColor(i, FUNNEL_STEPS.length)
            return (
              <div key={step.key} className="flex items-center gap-3">
                <span
                  className="w-28 text-right shrink-0"
                  style={{ fontSize: '11px', color: '#8A8580', fontFamily: "'Hanken Grotesk', sans-serif" }}
                >
                  {step.label}
                </span>
                <div
                  className="flex-1 h-7 overflow-hidden relative"
                  style={{ backgroundColor: '#0A0A0A', borderRadius: '2px' }}
                >
                  <div
                    className="h-full transition-all duration-500"
                    style={{ width: `${width}%`, backgroundColor: color, borderRadius: '2px' }}
                  />
                  <span
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'rgba(240, 237, 230, 0.8)',
                    }}
                  >
                    {count.toLocaleString('fr-FR')}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Daily chart */}
      <div className="card">
        <h3 className="label-upper mb-1">Activite quotidienne</h3>
        <div className="gold-rule mb-5" />
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#8A8580' }}
                tickFormatter={(d: string) => d.slice(5)}
              />
              <YAxis tick={{ fontSize: 11, fill: '#8A8580' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111111',
                  border: '1px solid #1E1E1E',
                  borderRadius: 2,
                  fontSize: 12,
                  color: '#F0EDE6',
                }}
                labelStyle={{ color: '#8A8580' }}
              />
              <Area
                type="monotone"
                dataKey="page_view"
                name="Vues"
                stroke="#C9A84C"
                fill="#C9A84C"
                fillOpacity={0.08}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="optin"
                name="Opt-ins"
                stroke="#4A7A5A"
                fill="#4A7A5A"
                fillOpacity={0.08}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="booking_confirmed"
                name="RDV confirmes"
                stroke="#8A8580"
                fill="#8A8580"
                fillOpacity={0.08}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sources breakdown */}
      <div className="card">
        <h3 className="label-upper mb-1">Sources UTM</h3>
        <div className="gold-rule mb-5" />
        {sources.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#8A8580' }}>Aucune donnee</p>
        ) : (
          <div className="space-y-2.5">
            {sources.slice(0, 10).map((s) => {
              const maxSource = sources[0]?.count || 1
              const width = Math.max((s.count / maxSource) * 100, 3)
              return (
                <div key={s.source} className="flex items-center gap-3">
                  <span
                    className="w-24 text-right shrink-0 truncate"
                    style={{ fontSize: '11px', color: '#8A8580' }}
                  >
                    {s.source}
                  </span>
                  <div
                    className="flex-1 h-6 overflow-hidden relative"
                    style={{ backgroundColor: '#0A0A0A', borderRadius: '2px' }}
                  >
                    <div
                      className="h-full"
                      style={{
                        width: `${width}%`,
                        backgroundColor: 'rgba(201, 168, 76, 0.25)',
                        borderRadius: '2px',
                      }}
                    />
                    <span
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'rgba(240, 237, 230, 0.8)',
                      }}
                    >
                      {s.count.toLocaleString('fr-FR')}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
