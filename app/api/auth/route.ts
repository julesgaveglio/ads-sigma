import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSigmaSession, signToken, hashPasswordAsync } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import { normalizeEmail } from '@/lib/utils'
import { COOKIE_NAME, COOKIE_MAX_AGE } from '@/lib/constants'

// POST — Login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    const normalized = normalizeEmail(email)
    const passwordHash = await hashPasswordAsync(password)

    const supabase = getSupabaseAdmin()
    const { data: user, error } = await supabase
      .from('sigma_users')
      .select('id, email, role, password_hash')
      .eq('email', normalized)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    if (user.password_hash !== passwordHash) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    const token = await signToken({
      user_id: user.id,
      email: user.email,
      role: user.role,
    })

    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    })

    return NextResponse.json({
      user: {
        user_id: user.id,
        email: user.email,
        role: user.role,
      },
    })
  } catch (err) {
    console.error('[AUTH POST]', err)
    return NextResponse.json(
      { error: 'Erreur interne' },
      { status: 500 }
    )
  }
}

// GET — Check session
export async function GET() {
  try {
    const session = await getSigmaSession()
    if (!session) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    return NextResponse.json({ user: session })
  } catch (err) {
    console.error('[AUTH GET]', err)
    return NextResponse.json(
      { error: 'Erreur interne' },
      { status: 500 }
    )
  }
}

// DELETE — Logout
export async function DELETE() {
  try {
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[AUTH DELETE]', err)
    return NextResponse.json(
      { error: 'Erreur interne' },
      { status: 500 }
    )
  }
}
