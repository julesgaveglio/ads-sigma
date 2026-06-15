'use client'

import { useRef, useEffect } from 'react'
import OptinForm from '@/components/tunnel/OptinForm'
import TrustpilotSection from '@/components/tunnel/TrustpilotSection'

const objections = [
  'Sans apport supplementaire',
  'Sans modifier votre mensualite',
  'Sans prendre de risque financier',
  'Methode validee par +200 investisseurs',
]

const benefits = [
  'Decouvrez la strategie immobiliere #1 en France',
  'Methode pas-a-pas expliquee en video',
  'Aucune connaissance prealable requise',
  'Resultats des les premiers mois',
]

function GoldDot() {
  return (
    <span
      className="inline-block flex-shrink-0 mt-[7px]"
      style={{
        width: 4,
        height: 4,
        borderRadius: '50%',
        backgroundColor: '#C9A84C',
      }}
    />
  )
}

function PlayIcon() {
  return (
    <div
      className="flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
      style={{
        width: 72,
        height: 72,
        borderRadius: 2,
        backgroundColor: '#C9A84C',
      }}
    >
      <svg
        className="ml-0.5"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="#0A0A0A"
      >
        <path d="M8 5v14l11-7z" />
      </svg>
    </div>
  )
}

export default function InscriptionClient() {
  const formRef = useRef<HTMLElement | null>(null)
  const revealRefs = useRef<HTMLElement[]>([])

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1 }
    )
    revealRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  function addRevealRef(el: HTMLElement | null) {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el)
    }
  }

  return (
    <main className="flex flex-col items-center">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section
        className="relative w-full overflow-hidden"
        style={{ paddingTop: 100, paddingBottom: 60 }}
      >
        {/* Subtle gold glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.04) 0%, transparent 60%)',
          }}
        />

        <div className="relative w-full max-w-3xl mx-auto px-4 text-center">
          <p className="label-upper mb-6">Sigma Factory</p>

          <hr className="gold-rule mx-auto mb-8" />

          <h1
            className="font-serif"
            style={{
              fontSize: 'clamp(28px, 5vw, 52px)',
              lineHeight: 1.15,
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: '#F0EDE6',
              textTransform: 'none',
            }}
          >
            La methode qui permet de solder{' '}
            <span style={{ color: '#C9A84C' }}>60 a 100%</span> de son credit
            immobilier en moins de{' '}
            <span style={{ color: '#C9A84C' }}>12 mois</span>
          </h1>

          {/* Objections */}
          <ul className="mt-10 flex flex-col sm:flex-row sm:flex-wrap justify-center gap-3 sm:gap-x-8 sm:gap-y-3">
            {objections.map((text) => (
              <li
                key={text}
                className="flex items-start gap-2.5 justify-center"
                style={{ color: '#8A8580', fontSize: 13 }}
              >
                <GoldDot />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Video thumbnail ──────────────────────────────── */}
      <section
        ref={addRevealRef}
        className="reveal w-full max-w-3xl mx-auto px-4"
        style={{ paddingBottom: 40 }}
      >
        <button
          onClick={scrollToForm}
          className="group relative w-full vsl-container cursor-pointer"
          style={{ border: '1px solid #1E1E1E' }}
          aria-label="Lire la video"
        >
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 z-10" style={{
            background: 'linear-gradient(to bottom, rgba(10,10,10,0.4), transparent, rgba(10,10,10,0.6))',
          }} />
          {/* Play icon */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <PlayIcon />
          </div>
        </button>
      </section>

      {/* ── CTA button ───────────────────────────────────── */}
      <section className="w-full max-w-md mx-auto px-4 text-center" style={{ paddingBottom: 60 }}>
        <button
          onClick={scrollToForm}
          className="btn btn-gold w-full"
        >
          Acceder a la video — 100% gratuite
        </button>
      </section>

      {/* ── Benefits ─────────────────────────────────────── */}
      <section
        ref={addRevealRef}
        className="reveal w-full max-w-2xl mx-auto px-4"
        style={{ paddingBottom: 80 }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {benefits.map((text) => (
            <div
              key={text}
              className="card flex items-start gap-3"
              style={{ padding: 24 }}
            >
              <GoldDot />
              <span style={{ fontSize: 13, color: '#F0EDE6', lineHeight: 1.6 }}>
                {text}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Opt-in form ──────────────────────────────────── */}
      <section
        ref={(el) => {
          formRef.current = el
          addRevealRef(el)
        }}
        className="reveal w-full max-w-md mx-auto px-4 scroll-mt-8"
        style={{ paddingBottom: 100 }}
      >
        <div className="card" style={{ padding: '32px 28px' }}>
          <h2
            className="font-serif text-center"
            style={{
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: '0.04em',
              color: '#F0EDE6',
              marginBottom: 4,
            }}
          >
            Regardez la presentation
          </h2>
          <p
            className="text-center"
            style={{ fontSize: 13, color: '#8A8580', marginBottom: 28 }}
          >
            Entrez vos informations pour acceder a la video gratuite.
          </p>
          <OptinForm />
        </div>
      </section>

      {/* ── Trustpilot ───────────────────────────────────── */}
      <TrustpilotSection />

      {/* ── Footer ───────────────────────────────────────── */}
      <footer
        className="w-full text-center"
        style={{
          padding: '32px 16px',
          fontSize: 11,
          color: '#4A4642',
          borderTop: '1px solid #1E1E1E',
        }}
      >
        Tes donnees restent 100% confidentielles. Pas de spam.
      </footer>
    </main>
  )
}
