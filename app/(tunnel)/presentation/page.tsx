import type { Metadata } from 'next'
import PresentationClient from './PresentationClient'

export const metadata: Metadata = {
  title: 'Sigma Factory — Presentation',
  description: 'Regardez la presentation Sigma Factory.',
  robots: { index: false, follow: false },
}

export default function PresentationPage() {
  return <PresentationClient />
}
