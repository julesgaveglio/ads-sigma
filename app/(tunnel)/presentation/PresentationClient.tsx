'use client'

import VSLPlayer from '@/components/tunnel/VSLPlayer'

export default function PresentationClient() {
  return (
    <main className="flex flex-col items-center min-h-screen">
      {/* Logo */}
      <header className="w-full text-center" style={{ padding: '28px 16px' }}>
        <span
          className="font-serif"
          style={{
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
          }}
        >
          <span style={{ color: '#F0EDE6' }}>SIGMA</span>
          {' '}
          <span style={{ color: '#C9A84C' }}>FACTORY</span>
        </span>
      </header>

      {/* Player */}
      <section className="w-full max-w-4xl mx-auto px-4 flex-1">
        <VSLPlayer />

        {/* Always-visible CTA below video */}
        <div style={{ marginTop: 32, marginBottom: 16 }}>
          <a
            href="#booking"
            className="btn btn-gold block w-full text-center"
          >
            Reserver mon appel strategique gratuit
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="w-full text-center"
        style={{
          padding: '32px 16px',
          fontSize: 11,
          color: '#4A4642',
          borderTop: '1px solid #1E1E1E',
        }}
      >
        Sigma Factory — Investissement immobilier
      </footer>
    </main>
  )
}
