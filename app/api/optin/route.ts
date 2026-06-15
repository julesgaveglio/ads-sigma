import { NextRequest, NextResponse } from 'next/server'
import { getSigmaSession } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { EXCLUDED_EMAILS } from '@/lib/constants'

// GET — Opt-in metrics (views, optins, rate)
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

    // If campaign_id is specified, get its date range for filtering
    let campaignStart: string | null = null
    let campaignEnd: string | null = null
    if (campaignId) {
      const { data: campaign } = await supabase
        .from('sigma_campaigns')
        .select('start_date, end_date')
        .eq('id', campaignId)
        .single()

      if (campaign) {
        campaignStart = campaign.start_date
        campaignEnd = campaign.end_date
      }
    }

    const effectiveStart = campaignStart || startDate
    const effectiveEnd = campaignEnd || endDate

    // Count unique session_ids for page_view events = views
    const { data: viewEvents, error: viewError } = await supabase
      .from('sigma_funnel_events')
      .select('session_id')
      .eq('event', 'page_view')
      .gte('created_at', effectiveStart)
      .lte('created_at', effectiveEnd)
      .not('session_id', 'is', null)

    if (viewError) {
      console.error('[OPTIN GET views]', viewError)
      return NextResponse.json({ error: 'Erreur base de donnees' }, { status: 500 })
    }

    const uniqueSessions = new Set(
      (viewEvents || []).map((e) => e.session_id)
    )
    const views = uniqueSessions.size

    // Count unique emails for optin events (excluding test emails)
    const { data: optinEvents, error: optinError } = await supabase
      .from('sigma_funnel_events')
      .select('email')
      .eq('event', 'optin')
      .gte('created_at', effectiveStart)
      .lte('created_at', effectiveEnd)
      .not('email', 'is', null)

    if (optinError) {
      console.error('[OPTIN GET optins]', optinError)
      return NextResponse.json({ error: 'Erreur base de donnees' }, { status: 500 })
    }

    const uniqueEmails = new Set(
      (optinEvents || [])
        .map((e) => e.email as string)
        .filter((email) => !EXCLUDED_EMAILS.includes(email))
    )
    const optins = uniqueEmails.size

    const rate = views > 0 ? Math.round((optins / views) * 1000) / 10 : 0

    return NextResponse.json({ views, optins, rate })
  } catch (err) {
    console.error('[OPTIN GET]', err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
