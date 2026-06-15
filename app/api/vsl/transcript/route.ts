import { NextRequest, NextResponse } from 'next/server'
import { getSigmaSession } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase-server'

// GET — Return transcript of the active VSL version
export async function GET() {
  try {
    const session = await getSigmaSession()
    if (!session) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('sigma_vsl_versions')
      .select('name, transcript_srt, transcript_text')
      .eq('is_active', true)
      .single()

    if (error || !data) {
      console.error('[VSL TRANSCRIPT GET]', error)
      return NextResponse.json(
        { error: 'Aucune version VSL active trouvee' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      version_name: data.name,
      transcript_srt: data.transcript_srt,
      transcript_text: data.transcript_text,
    })
  } catch (err) {
    console.error('[VSL TRANSCRIPT GET]', err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

// PATCH — Update transcript of the active VSL version
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSigmaSession()
    if (!session) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

    const body = await request.json()
    const { transcript_srt, transcript_text } = body

    if (transcript_srt === undefined && transcript_text === undefined) {
      return NextResponse.json(
        { error: 'Au moins un champ transcript requis' },
        { status: 400 }
      )
    }

    const updates: Record<string, string | null> = {}
    if (transcript_srt !== undefined) updates.transcript_srt = transcript_srt
    if (transcript_text !== undefined) updates.transcript_text = transcript_text

    const supabase = getSupabaseAdmin()

    // Find the active version
    const { data: active, error: findError } = await supabase
      .from('sigma_vsl_versions')
      .select('id')
      .eq('is_active', true)
      .single()

    if (findError || !active) {
      return NextResponse.json(
        { error: 'Aucune version VSL active trouvee' },
        { status: 404 }
      )
    }

    const { data, error } = await supabase
      .from('sigma_vsl_versions')
      .update(updates)
      .eq('id', active.id)
      .select('name, transcript_srt, transcript_text')
      .single()

    if (error) {
      console.error('[VSL TRANSCRIPT PATCH]', error)
      return NextResponse.json({ error: 'Erreur mise a jour' }, { status: 500 })
    }

    return NextResponse.json({
      version_name: data.name,
      transcript_srt: data.transcript_srt,
      transcript_text: data.transcript_text,
    })
  } catch (err) {
    console.error('[VSL TRANSCRIPT PATCH]', err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
