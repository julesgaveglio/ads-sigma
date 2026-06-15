import { NextResponse } from 'next/server'
import { getSigmaSession } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { EXCLUDED_EMAILS } from '@/lib/constants'

// GET — VSL stats per version
export async function GET() {
  try {
    const session = await getSigmaSession()
    if (!session) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

    const supabase = getSupabaseAdmin()

    // Fetch all VSL versions
    const { data: versions, error: versionsError } = await supabase
      .from('sigma_vsl_versions')
      .select('id, name, color, is_active, created_at')
      .order('created_at', { ascending: true })

    if (versionsError) {
      console.error('[VSL GET versions]', versionsError)
      return NextResponse.json({ error: 'Erreur base de donnees' }, { status: 500 })
    }

    if (!versions || versions.length === 0) {
      return NextResponse.json({ versions: [] })
    }

    // Fetch all vsl_view events
    const { data: viewEvents, error: viewError } = await supabase
      .from('sigma_funnel_events')
      .select('email, metadata')
      .eq('event', 'vsl_view')
      .not('email', 'is', null)

    if (viewError) {
      console.error('[VSL GET views]', viewError)
      return NextResponse.json({ error: 'Erreur base de donnees' }, { status: 500 })
    }

    // Fetch all vsl_100 events
    const { data: completionEvents, error: completionError } = await supabase
      .from('sigma_funnel_events')
      .select('email, metadata')
      .eq('event', 'vsl_100')
      .not('email', 'is', null)

    if (completionError) {
      console.error('[VSL GET completions]', completionError)
      return NextResponse.json({ error: 'Erreur base de donnees' }, { status: 500 })
    }

    const firstVersionId = versions[0].id

    // Helper: get version ID from event metadata, default to first version
    const getVersionId = (metadata: Record<string, unknown> | null): string => {
      if (metadata && typeof metadata.vsl_version_id === 'string') {
        return metadata.vsl_version_id
      }
      return firstVersionId
    }

    // Build stats per version
    const stats = versions.map((version) => {
      // Unique viewers for this version (excluding test emails)
      const viewerEmails = new Set(
        (viewEvents || [])
          .filter((e) => {
            const vid = getVersionId(e.metadata as Record<string, unknown> | null)
            return vid === version.id && !EXCLUDED_EMAILS.includes(e.email!)
          })
          .map((e) => e.email)
      )

      // Unique completions for this version (excluding test emails)
      const completionEmails = new Set(
        (completionEvents || [])
          .filter((e) => {
            const vid = getVersionId(e.metadata as Record<string, unknown> | null)
            return vid === version.id && !EXCLUDED_EMAILS.includes(e.email!)
          })
          .map((e) => e.email)
      )

      const viewers = viewerEmails.size
      const completions = completionEmails.size
      const rate = viewers > 0 ? Math.round((completions / viewers) * 1000) / 10 : 0

      return {
        id: version.id,
        name: version.name,
        color: version.color,
        viewers,
        completions,
        rate,
      }
    })

    return NextResponse.json({ versions: stats })
  } catch (err) {
    console.error('[VSL GET]', err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
