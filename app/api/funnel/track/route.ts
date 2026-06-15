import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

// POST — Track funnel event (public, no auth)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      event,
      session_id,
      email,
      firstname,
      page,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      referrer,
      metadata,
    } = body

    if (!event) {
      return NextResponse.json(
        { error: 'Event requis' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    const { error } = await supabase
      .from('sigma_funnel_events')
      .insert({
        event,
        session_id: session_id || null,
        email: email ? email.trim().toLowerCase() : null,
        firstname: firstname || null,
        page: page || null,
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
        utm_content: utm_content || null,
        utm_term: utm_term || null,
        referrer: referrer || null,
        metadata: metadata || null,
      })

    if (error) {
      console.error('[FUNNEL TRACK]', error)
      return NextResponse.json({ error: 'Erreur enregistrement evenement' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[FUNNEL TRACK]', err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
