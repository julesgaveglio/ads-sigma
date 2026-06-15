import { NextRequest, NextResponse } from 'next/server'
import { getSigmaSession } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { EXCLUDED_EMAILS } from '@/lib/constants'
import type { FunnelEventType } from '@/types'

const ALL_EVENT_TYPES: FunnelEventType[] = [
  'page_view',
  'optin',
  'vsl_view',
  'vsl_25',
  'vsl_50',
  'vsl_75',
  'vsl_100',
  'booking_start',
  'booking_confirmed',
]

// GET — Full funnel metrics
export async function GET(request: NextRequest) {
  try {
    const session = await getSigmaSession()
    if (!session) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaign_id')

    // Determine date range
    let startDate: string
    let endDate: string

    const startParam = searchParams.get('start')
    const endParam = searchParams.get('end')
    const daysParam = searchParams.get('days')

    if (startParam && endParam) {
      startDate = startParam
      endDate = endParam
    } else {
      const days = parseInt(daysParam || '30', 10)
      const now = new Date()
      const start = new Date(now)
      start.setDate(start.getDate() - days)
      startDate = start.toISOString()
      endDate = now.toISOString()
    }

    const supabase = getSupabaseAdmin()

    // If campaign_id, narrow to campaign date range
    if (campaignId) {
      const { data: campaign } = await supabase
        .from('sigma_campaigns')
        .select('start_date, end_date')
        .eq('id', campaignId)
        .single()

      if (campaign) {
        if (campaign.start_date) startDate = campaign.start_date
        if (campaign.end_date) endDate = campaign.end_date
      }
    }

    // Fetch all events in range
    const { data: events, error } = await supabase
      .from('sigma_funnel_events')
      .select('event, session_id, email, utm_source, created_at')
      .gte('created_at', startDate)
      .lte('created_at', endDate)

    if (error) {
      console.error('[FUNNEL GET]', error)
      return NextResponse.json({ error: 'Erreur base de donnees' }, { status: 500 })
    }

    // Filter out excluded emails
    const filtered = (events || []).filter(
      (e) => !e.email || !EXCLUDED_EMAILS.includes(e.email)
    )

    // --- Funnel: count unique keys per event type ---
    const funnel: Record<string, number> = {}
    for (const eventType of ALL_EVENT_TYPES) {
      const eventsOfType = filtered.filter((e) => e.event === eventType)

      if (eventType === 'page_view') {
        // Unique by session_id
        const unique = new Set(eventsOfType.map((e) => e.session_id).filter(Boolean))
        funnel[eventType] = unique.size
      } else {
        // Unique by email
        const unique = new Set(eventsOfType.map((e) => e.email).filter(Boolean))
        funnel[eventType] = unique.size
      }
    }

    // --- Daily: group by date, count each event type per day ---
    const dailyMap: Record<string, Record<string, number>> = {}
    for (const ev of filtered) {
      const date = ev.created_at.slice(0, 10) // YYYY-MM-DD
      if (!dailyMap[date]) {
        dailyMap[date] = {}
        for (const t of ALL_EVENT_TYPES) dailyMap[date][t] = 0
      }
      dailyMap[date][ev.event] = (dailyMap[date][ev.event] || 0) + 1
    }

    const daily = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, counts]) => ({ date, ...counts }))

    // --- Sources: group by utm_source, count ---
    const sourceMap: Record<string, number> = {}
    for (const ev of filtered) {
      const source = ev.utm_source || 'direct'
      sourceMap[source] = (sourceMap[source] || 0) + 1
    }

    const sources = Object.entries(sourceMap)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({ funnel, daily, sources })
  } catch (err) {
    console.error('[FUNNEL GET]', err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
