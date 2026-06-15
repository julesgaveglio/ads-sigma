import type { Metadata } from 'next'
import InscriptionClient from './InscriptionClient'

export const metadata: Metadata = {
  title: 'Sigma Factory — Soldez votre credit immobilier',
  description:
    'Decouvrez la methode qui permet de solder 60 a 100% de son credit immobilier en moins de 12 mois.',
  robots: { index: false, follow: false },
}

export default function InscriptionPage() {
  return <InscriptionClient />
}
