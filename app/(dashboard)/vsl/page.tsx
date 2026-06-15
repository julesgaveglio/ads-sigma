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
  Legend,
} from 'recharts'
import type { VSLStats, FunnelMetrics } from '@/types'

export default function VSLPage() {
  const { activeCampaignId } = useCampaignContext()
  const [versions, setVersions] = useState<VSLStats[]>([])
  const [funnelData, setFunnelData] = useState<FunnelMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ days: '30' })
      if (activeCampaignId !== 'all') params.set('campaign_id', activeCampaignId)

      const [vslRes, funnelRes] = await Promise.all([
        fetch(`/api/vsl?${params}`),
        fetch(`/api/funnel?${params}`),
      ])

      if (vslRes.ok) {
        const data = await vslRes.json()
        setVersions(Array.isArray(data) ? data : data.versions || [])
      }
      if (funnelRes.ok) {
        const data = await funnelRes.json()
        setFunnelData(data)
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

  // Build retention chart data
  const retentionData = [
    { milestone: '25%', key: 'vsl_25' },
    { milestone: '50%', key: 'vsl_50' },
    { milestone: '75%', key: 'vsl_75' },
    { milestone: '100%', key: 'vsl_100' },
  ]

  if (loading) {
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
          VSL Analytics
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
          className="h-72 animate-pulse"
          style={{ backgroundColor: '#111111', border: '1px solid #1E1E1E', borderRadius: '2px' }}
        />
      </div>
    )
  }

  // Daily VSL data from funnel
  const dailyVsl = funnelData?.daily?.map((d) => ({
    date: d.date,
    vsl_view: d.vsl_view || 0,
    vsl_100: d.vsl_100 || 0,
  })) || []

  const tooltipStyle = {
    backgroundColor: '#111111',
    border: '1px solid #1E1E1E',
    borderRadius: 2,
    fontSize: 12,
    color: '#F0EDE6',
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
        VSL Analytics
      </h2>

      {/* KPI per version */}
      {versions.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {versions.map((v) => (
            <KPICard
              key={v.id}
              title={v.name}
              value={v.viewers.toLocaleString('fr-FR')}
              subtitle={`${v.rate}% completion`}
              color={v.color || '#C9A84C'}
            />
          ))}
        </div>
      ) : (
        /* Fallback KPIs from funnel data */
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="VSL vues"
            value={funnelData?.funnel.vsl_view?.toLocaleString('fr-FR') ?? 0}
            color="#C9A84C"
          />
          <KPICard
            title="VSL 25%"
            value={funnelData?.funnel.vsl_25?.toLocaleString('fr-FR') ?? 0}
            color="#C9A84C"
          />
          <KPICard
            title="VSL 75%"
            value={funnelData?.funnel.vsl_75?.toLocaleString('fr-FR') ?? 0}
            color="#4A7A5A"
          />
          <KPICard
            title="VSL 100%"
            value={funnelData?.funnel.vsl_100?.toLocaleString('fr-FR') ?? 0}
            color="#4A7A5A"
            subtitle={
              funnelData?.funnel.vsl_view
                ? `${(((funnelData.funnel.vsl_100 || 0) / funnelData.funnel.vsl_view) * 100).toFixed(1)}% completion`
                : undefined
            }
          />
        </div>
      )}

      {/* Retention chart */}
      <div className="card">
        <h3 className="label-upper mb-1">Retention VSL</h3>
        <div className="gold-rule mb-5" />
        {versions.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={retentionData.map((point) => {
                  const row: Record<string, string | number> = { milestone: point.milestone }
                  versions.forEach((v) => {
                    const totalViewers = v.viewers || 1
                    row[v.name] = Math.round(
                      totalViewers * (1 - (parseInt(point.milestone) / 100) * (1 - v.rate / 100))
                    )
                  })
                  return row
                })}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" />
                <XAxis dataKey="milestone" tick={{ fontSize: 11, fill: '#8A8580' }} />
                <YAxis tick={{ fontSize: 11, fill: '#8A8580' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                {versions.map((v) => (
                  <Area
                    key={v.id}
                    type="monotone"
                    dataKey={v.name}
                    stroke={v.color || '#C9A84C'}
                    fill={v.color || '#C9A84C'}
                    fillOpacity={0.08}
                    strokeWidth={2}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : funnelData ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={[
                  { milestone: 'Vue', count: funnelData.funnel.vsl_view || 0 },
                  { milestone: '25%', count: funnelData.funnel.vsl_25 || 0 },
                  { milestone: '50%', count: funnelData.funnel.vsl_50 || 0 },
                  { milestone: '75%', count: funnelData.funnel.vsl_75 || 0 },
                  { milestone: '100%', count: funnelData.funnel.vsl_100 || 0 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" />
                <XAxis dataKey="milestone" tick={{ fontSize: 11, fill: '#8A8580' }} />
                <YAxis tick={{ fontSize: 11, fill: '#8A8580' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Viewers"
                  stroke="#C9A84C"
                  fill="#C9A84C"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p style={{ fontSize: '13px', color: '#8A8580' }}>Aucune donnee</p>
        )}
      </div>

      {/* Daily VSL chart */}
      {dailyVsl.length > 0 && (
        <div className="card">
          <h3 className="label-upper mb-1">Vues VSL quotidiennes</h3>
          <div className="gold-rule mb-5" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyVsl}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#8A8580' }}
                  tickFormatter={(d: string) => d.slice(5)}
                />
                <YAxis tick={{ fontSize: 11, fill: '#8A8580' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="vsl_view" name="VSL vues" fill="#C9A84C" radius={[2, 2, 0, 0]} />
                <Bar dataKey="vsl_100" name="VSL 100%" fill="#4A7A5A" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
