import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { normalizeEmail } from '@/lib/utils'

// POST — Track opt-in (public, no auth)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      firstname,
      phone,
      session_id,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      referrer,
    } = body

    if (!email || !session_id) {
      return NextResponse.json(
        { error: 'Email et session_id requis' },
        { status: 400 }
      )
    }

    const normalized = normalizeEmail(email)
    const supabase = getSupabaseAdmin()

    // Upsert lead (update if email exists, insert otherwise)
    const { error: leadError } = await supabase
      .from('sigma_leads')
      .upsert(
        {
          email: normalized,
          firstname: firstname || null,
          phone: phone || null,
          utm_source: utm_source || null,
          utm_medium: utm_medium || null,
          utm_campaign: utm_campaign || null,
          utm_content: utm_content || null,
          utm_term: utm_term || null,
        },
        { onConflict: 'email' }
      )

    if (leadError) {
      console.error('[OPTIN TRACK] lead upsert error:', leadError)
      return NextResponse.json({ error: 'Erreur enregistrement lead' }, { status: 500 })
    }

    // Insert optin funnel event
    const { error: eventError } = await supabase
      .from('sigma_funnel_events')
      .insert({
        event: 'optin',
        email: normalized,
        firstname: firstname || null,
        session_id,
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
        utm_content: utm_content || null,
        utm_term: utm_term || null,
        referrer: referrer || null,
      })

    if (eventError) {
      console.error('[OPTIN TRACK] event insert error:', eventError)
      return NextResponse.json({ error: 'Erreur enregistrement evenement' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[OPTIN TRACK]', err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
