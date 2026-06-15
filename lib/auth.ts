import { cookies } from 'next/headers'
import { COOKIE_NAME } from './constants'
import { getSupabaseAdmin } from './supabase-server'
import type { SessionPayload } from '@/types'

const FALLBACK_SECRET = 'sigma-fallback-secret-key-32chars'

function getSecret(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || FALLBACK_SECRET
}

async function hmacSign(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  const bytes = new Uint8Array(signature)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

async function hmacVerify(payload: string, signature: string, secret: string): Promise<boolean> {
  const expected = await hmacSign(payload, secret)
  return expected === signature
}

export async function signToken(payload: SessionPayload): Promise<string> {
  const data = btoa(JSON.stringify(payload))
  const signature = await hmacSign(data, getSecret())
  return `${data}.${signature}`
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  const [data, signature] = token.split('.')
  if (!data || !signature) return null

  const valid = await hmacVerify(data, signature, getSecret())
  if (!valid) return null

  try {
    return JSON.parse(atob(data)) as SessionPayload
  } catch {
    return null
  }
}

export function hashPassword(password: string): string {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  // Sync SHA-256 via SubtleCrypto not available sync — use simple hash for compat
  // In production, this runs server-side via the API route (async)
  return password // placeholder — actual hashing in route
}

export async function hashPasswordAsync(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function getSigmaSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null

  const payload = await verifyToken(token)
  if (!payload) return null

  // Verify user still exists in DB
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('sigma_users')
    .select('id')
    .eq('id', payload.user_id)
    .single()

  if (!data) return null
  return payload
}
