import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-server'

const WEBHOOK_SECRET = 'sigma_cal_webhook_2026'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const triggerEvent = body.triggerEvent || body.type

    console.log('[CAL WEBHOOK]', triggerEvent, JSON.stringify(body).slice(0, 500))

    if (triggerEvent === 'BOOKING_CREATED') {
      const payload = body.payload || body
      const attendee = payload.attendees?.[0] || payload.responses || {}
      const email = attendee.email || payload.email || ''
      const name = attendee.name || payload.name || ''
      const phone = payload.responses?.phone?.value || attendee.phone || ''

      if (!email) {
        return NextResponse.json({ ok: true, skipped: 'no email' })
      }

      const supabase = getSupabaseAdmin()

      // Check if lead already exists
      const { data: existing } = await supabase
        .from('sigma_leads')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle()

      if (existing) {
        // Update existing lead with booking info
        await supabase
          .from('sigma_leads')
          .update({
            firstname: name.split(' ')[0] || name,
            phone: phone || undefined,
          })
          .eq('id', existing.id)
      } else {
        // Create new lead
        await supabase
          .from('sigma_leads')
          .insert({
            email: email.toLowerCase().trim(),
            firstname: name.split(' ')[0] || name,
            phone: phone || null,
            utm_source: 'cal_booking',
            utm_medium: 'website',
          })
      }

      // Track funnel event
      await supabase
        .from('sigma_funnel_events')
        .insert({
          event_type: 'booking_confirmed',
          email: email.toLowerCase().trim(),
          utm_source: 'website',
          utm_medium: 'organic',
        })

      return NextResponse.json({ ok: true, event: 'booking_created' })
    }

    if (triggerEvent === 'BOOKING_CANCELLED') {
      // Log but don't delete the lead
      return NextResponse.json({ ok: true, event: 'booking_cancelled' })
    }

    return NextResponse.json({ ok: true, event: triggerEvent })
  } catch (err) {
    console.error('[CAL WEBHOOK ERROR]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
