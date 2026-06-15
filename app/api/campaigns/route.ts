import { NextRequest, NextResponse } from 'next/server'
import { getSigmaSession } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase-server'

// GET — List all campaigns
export async function GET() {
  try {
    const session = await getSigmaSession()
    if (!session) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('sigma_campaigns')
      .select('*')
      .order('start_date', { ascending: false })

    if (error) {
      console.error('[CAMPAIGNS GET]', error)
      return NextResponse.json({ error: 'Erreur base de donnees' }, { status: 500 })
    }

    return NextResponse.json({ campaigns: data })
  } catch (err) {
    console.error('[CAMPAIGNS GET]', err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

// POST — Create campaign
export async function POST(request: NextRequest) {
  try {
    const session = await getSigmaSession()
    if (!session) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

    const body = await request.json()
    const { name, start_date, budget_euros } = body

    if (!name || !start_date) {
      return NextResponse.json(
        { error: 'Nom et date de debut requis' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('sigma_campaigns')
      .insert({ name, start_date, budget_euros: budget_euros ?? null })
      .select()
      .single()

    if (error) {
      console.error('[CAMPAIGNS POST]', error)
      return NextResponse.json({ error: 'Erreur creation campagne' }, { status: 500 })
    }

    return NextResponse.json({ campaign: data }, { status: 201 })
  } catch (err) {
    console.error('[CAMPAIGNS POST]', err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

// PATCH — Update campaign
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSigmaSession()
    if (!session) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

    const body = await request.json()
    const { id, ...fields } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('sigma_campaigns')
      .update(fields)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[CAMPAIGNS PATCH]', error)
      return NextResponse.json({ error: 'Erreur mise a jour campagne' }, { status: 500 })
    }

    return NextResponse.json({ campaign: data })
  } catch (err) {
    console.error('[CAMPAIGNS PATCH]', err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
