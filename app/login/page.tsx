'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    fetch('/api/auth')
      .then((res) => {
        if (res.ok) router.replace('/')
      })
      .catch(() => {})
      .finally(() => setChecking(false))
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (res.ok) {
        router.replace('/')
      } else {
        const data = await res.json()
        setError(data.error || 'Erreur de connexion')
      }
    } catch {
      setError('Erreur reseau')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A0A0A' }}>
        <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C9A84C', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#0A0A0A' }}>
      <div className="w-full max-w-sm">
        {/* Logo + subtitle */}
        <div className="text-center mb-8 flex flex-col items-center">
          <img
            src="/logo-sigma.png"
            alt="Sigma Factory"
            style={{ height: '64px', width: 'auto', marginBottom: '16px' }}
          />
          <div className="gold-rule my-4" />
          <p className="label-upper">Espace Analytics</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
          style={{
            backgroundColor: '#111111',
            border: '1px solid #1E1E1E',
            borderRadius: '2px',
            padding: '32px',
          }}
        >
          {error && (
            <div
              className="text-sm px-4 py-3"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.06)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                borderRadius: '2px',
                color: '#ef4444',
              }}
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="label-upper block mb-2"
              style={{ color: '#8A8580' }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-2.5 text-sm transition-colors focus:outline-none"
              style={{
                backgroundColor: '#0D0D0D',
                border: '1px solid #1E1E1E',
                borderRadius: '2px',
                color: '#F0EDE6',
                fontFamily: "'Hanken Grotesk', sans-serif",
              }}
              onFocus={(e) => (e.target.style.borderColor = '#C9A84C')}
              onBlur={(e) => (e.target.style.borderColor = '#1E1E1E')}
              placeholder="vous@exemple.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="label-upper block mb-2"
              style={{ color: '#8A8580' }}
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-2.5 text-sm transition-colors focus:outline-none"
              style={{
                backgroundColor: '#0D0D0D',
                border: '1px solid #1E1E1E',
                borderRadius: '2px',
                color: '#F0EDE6',
                fontFamily: "'Hanken Grotesk', sans-serif",
              }}
              onFocus={(e) => (e.target.style.borderColor = '#C9A84C')}
              onBlur={(e) => (e.target.style.borderColor = '#1E1E1E')}
              placeholder="Mot de passe"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-gold w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span
                  className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: '#0A0A0A', borderTopColor: 'transparent' }}
                />
                Connexion...
              </span>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
