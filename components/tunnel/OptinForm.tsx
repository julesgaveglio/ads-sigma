'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface FormErrors {
  prenom?: string
  email?: string
  server?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function OptinForm() {
  const router = useRouter()
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [utms, setUtms] = useState<Record<string, string>>({})

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const extracted: Record<string, string> = {}
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
      const val = params.get(key)
      if (val) extracted[key] = val
    }
    setUtms(extracted)
  }, [])

  const validate = useCallback((): FormErrors => {
    const e: FormErrors = {}
    const trimmed = prenom.trim()
    if (!trimmed) {
      e.prenom = 'Le prenom est requis.'
    } else if (trimmed.length < 2 || trimmed.length > 50) {
      e.prenom = 'Le prenom doit faire entre 2 et 50 caracteres.'
    }
    if (!email.trim()) {
      e.email = "L'email est requis."
    } else if (!EMAIL_RE.test(email.trim())) {
      e.email = 'Veuillez entrer un email valide.'
    }
    return e
  }, [prenom, email])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setLoading(true)
    try {
      const session_id = crypto.randomUUID()

      await fetch('/api/optin/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          firstname: prenom.trim(),
          session_id,
          ...utms,
        }),
      })

      localStorage.setItem(
        'sigma_funnel',
        JSON.stringify({
          firstname: prenom.trim(),
          email: email.trim().toLowerCase(),
        })
      )

      router.push('/presentation')
    } catch {
      setErrors({ server: 'Une erreur est survenue. Veuillez reessayer.' })
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    backgroundColor: '#0D0D0D',
    border: '1px solid #1E1E1E',
    borderRadius: 2,
    color: '#F0EDE6',
    fontFamily: "'Hanken Grotesk', -apple-system, sans-serif",
    fontSize: 15,
    outline: 'none',
    transition: 'border-color 0.2s ease',
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {/* Prenom */}
      <div>
        <label htmlFor="prenom" className="sr-only">
          Prenom
        </label>
        <input
          id="prenom"
          type="text"
          placeholder="Votre prenom"
          value={prenom}
          onChange={(e) => {
            setPrenom(e.target.value)
            if (errors.prenom) setErrors((prev) => ({ ...prev, prenom: undefined }))
          }}
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#C9A84C' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#1E1E1E' }}
          autoComplete="given-name"
        />
        {errors.prenom && (
          <p style={{ marginTop: 6, fontSize: 11, color: '#A0413A' }}>{errors.prenom}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="sr-only">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="Votre email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
          }}
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#C9A84C' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#1E1E1E' }}
          autoComplete="email"
        />
        {errors.email && (
          <p style={{ marginTop: 6, fontSize: 11, color: '#A0413A' }}>{errors.email}</p>
        )}
      </div>

      {/* Server error */}
      {errors.server && (
        <p style={{ fontSize: 11, color: '#A0413A', textAlign: 'center' }}>{errors.server}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="btn btn-gold w-full flex items-center justify-center gap-2"
        style={{
          opacity: loading ? 0.5 : 1,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                style={{ opacity: 0.25 }}
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                style={{ opacity: 0.75 }}
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            Chargement...
          </>
        ) : (
          'Acceder a la presentation'
        )}
      </button>
    </form>
  )
}
