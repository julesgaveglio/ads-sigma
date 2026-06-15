import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sigma Factory',
  description: 'Investissement immobilier — Sigma Factory',
  robots: { index: false, follow: false },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
