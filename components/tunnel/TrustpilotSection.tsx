'use client'

const testimonials = [
  {
    name: 'Julien M.',
    text: "Grace a Sigma Factory, j'ai rembourse 80% de mon credit en 9 mois. Incroyable.",
  },
  {
    name: 'Sophie L.',
    text: "La methode est claire, pas besoin d'etre un expert. Mon conseiller m'a accompagnee a chaque etape.",
  },
  {
    name: 'Marc D.',
    text: "J'etais sceptique, mais les resultats parlent d'eux-memes. +45 000 EUR d'economie sur mon pret.",
  },
]

function Stars() {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 20 20"
          fill="#C9A84C"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function TrustpilotSection() {
  return (
    <section className="w-full max-w-4xl mx-auto px-4" style={{ paddingBottom: 80 }}>
      {/* Badge */}
      <div className="flex flex-col items-center gap-3 mb-10">
        <Stars />
        <p className="font-serif" style={{
          fontSize: 20,
          fontWeight: 600,
          fontStyle: 'italic',
          letterSpacing: '0.04em',
          color: '#F0EDE6',
        }}>
          Excellent
        </p>
        <span style={{ fontSize: 11, color: '#8A8580', letterSpacing: '0.06em' }}>
          5/5 sur Trustpilot
        </span>
        <hr className="gold-rule" style={{ marginTop: 4 }} />
      </div>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="card flex flex-col gap-4"
            style={{ padding: 32 }}
          >
            <Stars />
            <p style={{
              fontSize: 13,
              color: '#8A8580',
              lineHeight: 1.7,
            }}>
              &ldquo;{t.text}&rdquo;
            </p>
            <p
              className="mt-auto"
              style={{
                fontFamily: "'Hanken Grotesk', -apple-system, sans-serif",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#C9A84C',
              }}
            >
              {t.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
