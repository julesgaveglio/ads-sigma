import { NextRequest, NextResponse } from 'next/server'
import { getSigmaSession } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase-server'

// GET — List email campaigns with stats
export async function GET() {
  try {
    const session = await getSigmaSession()
    if (!session) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

    const supabase = getSupabaseAdmin()

    // Fetch all email campaigns
    const { data: campaigns, error: campError } = await supabase
      .from('sigma_email_campaigns')
      .select('*')
      .order('created_at', { ascending: false })

    if (campError) {
      console.error('[EMAILS GET campaigns]', campError)
      return NextResponse.json({ error: 'Erreur base de donnees' }, { status: 500 })
    }

    if (!campaigns || campaigns.length === 0) {
      return NextResponse.json({ campaigns: [] })
    }

    // Fetch all sends grouped by campaign_id
    const { data: sends, error: sendsError } = await supabase
      .from('sigma_email_sends')
      .select('campaign_id, sent_at')

    if (sendsError) {
      console.error('[EMAILS GET sends]', sendsError)
      return NextResponse.json({ error: 'Erreur base de donnees' }, { status: 500 })
    }

    // Fetch all clicks
    const { data: clicks, error: clicksError } = await supabase
      .from('sigma_email_clicks')
      .select('campaign_name')

    if (clicksError) {
      console.error('[EMAILS GET clicks]', clicksError)
      return NextResponse.json({ error: 'Erreur base de donnees' }, { status: 500 })
    }

    // Build sends count and last_sent per campaign_id
    const sendsMap: Record<string, { count: number; last_sent: string | null }> = {}
    for (const send of sends || []) {
      if (!sendsMap[send.campaign_id]) {
        sendsMap[send.campaign_id] = { count: 0, last_sent: null }
      }
      sendsMap[send.campaign_id].count++
      if (
        !sendsMap[send.campaign_id].last_sent ||
        send.sent_at > sendsMap[send.campaign_id].last_sent!
      ) {
        sendsMap[send.campaign_id].last_sent = send.sent_at
      }
    }

    // Build clicks count per campaign_name
    const clicksMap: Record<string, number> = {}
    for (const click of clicks || []) {
      clicksMap[click.campaign_name] = (clicksMap[click.campaign_name] || 0) + 1
    }

    // Enrich campaigns with stats
    const enriched = campaigns.map((campaign) => ({
      ...campaign,
      sends_count: sendsMap[campaign.id]?.count ?? 0,
      last_sent: sendsMap[campaign.id]?.last_sent ?? null,
      clicks_count: clicksMap[campaign.name] ?? 0,
    }))

    return NextResponse.json({ campaigns: enriched })
  } catch (err) {
    console.error('[EMAILS GET]', err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

// POST — Create email campaign
export async function POST(request: NextRequest) {
  try {
    const session = await getSigmaSession()
    if (!session) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

    const body = await request.json()
    const { name, subject, body_html } = body

    if (!name || !subject || !body_html) {
      return NextResponse.json(
        { error: 'Nom, sujet et contenu HTML requis' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('sigma_email_campaigns')
      .insert({ name, subject, body_html })
      .select()
      .single()

    if (error) {
      console.error('[EMAILS POST]', error)
      return NextResponse.json({ error: 'Erreur creation campagne email' }, { status: 500 })
    }

    return NextResponse.json({ campaign: data }, { status: 201 })
  } catch (err) {
    console.error('[EMAILS POST]', err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

// PATCH — Update email campaign
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSigmaSession()
    if (!session) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

    const body = await request.json()
    const { id, ...fields } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    // Only allow safe fields
    const allowed = ['name', 'subject', 'body_html', 'color']
    const updates: Record<string, unknown> = {}
    for (const key of allowed) {
      if (fields[key] !== undefined) updates[key] = fields[key]
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'Aucun champ a mettre a jour' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('sigma_email_campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[EMAILS PATCH]', error)
      return NextResponse.json({ error: 'Erreur mise a jour' }, { status: 500 })
    }

    return NextResponse.json({ campaign: data })
  } catch (err) {
    console.error('[EMAILS PATCH]', err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
