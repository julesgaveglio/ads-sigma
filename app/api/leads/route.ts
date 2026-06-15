import { NextRequest, NextResponse } from 'next/server'
import { getSigmaSession } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { EXCLUDED_EMAILS } from '@/lib/constants'

// GET — Paginated list of leads with VSL watch time
export async function GET(request: NextRequest) {
  try {
    const session = await getSigmaSession()
    if (!session) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get('per_page') || '50', 10)))
    const search = searchParams.get('search')?.trim() || ''

    const supabase = getSupabaseAdmin()
    const offset = (page - 1) * perPage

    // Build leads query
    let query = supabase
      .from('sigma_leads')
      .select('*', { count: 'exact' })
      .not('email', 'in', `(${EXCLUDED_EMAILS.join(',')})`)
      .order('created_at', { ascending: false })
      .range(offset, offset + perPage - 1)

    if (search) {
      query = query.or(
        `email.ilike.%${search}%,firstname.ilike.%${search}%,phone.ilike.%${search}%`
      )
    }

    const { data: leads, error, count } = await query

    if (error) {
      console.error('[LEADS GET]', error)
      return NextResponse.json({ error: 'Erreur base de donnees' }, { status: 500 })
    }

    // Fetch max VSL seconds for each lead
    const leadsWithVsl = await Promise.all(
      (leads || []).map(async (lead) => {
        const { data: events } = await supabase
          .from('sigma_funnel_events')
          .select('metadata')
          .eq('email', lead.email)
          .like('event', 'vsl_%')

        let maxSeconds = 0
        if (events) {
          for (const ev of events) {
            const seconds = Number(
              (ev.metadata as Record<string, unknown>)?.seconds ?? 0
            )
            if (seconds > maxSeconds) maxSeconds = seconds
          }
        }

        return { ...lead, vsl_seconds: maxSeconds }
      })
    )

    return NextResponse.json({
      leads: leadsWithVsl,
      total: count ?? 0,
      page,
      per_page: perPage,
    })
  } catch (err) {
    console.error('[LEADS GET]', err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

// DELETE — Hard delete a lead
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSigmaSession()
    if (!session) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { error } = await supabase
      .from('sigma_leads')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[LEADS DELETE]', error)
      return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[LEADS DELETE]', err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
