'use client'

import { useState } from 'react'
import { CampaignProvider } from '@/contexts/CampaignContext'
import NavMenu from './NavMenu'

interface DashboardShellProps {
  userEmail: string
  children: React.ReactNode
}

export default function DashboardShell({ userEmail, children }: DashboardShellProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <CampaignProvider>
      <div className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
        {/* Sticky top bar */}
        <header
          className="sticky top-0 z-30"
          style={{
            backgroundColor: '#0A0A0A',
            borderBottom: '1px solid #1E1E1E',
          }}
        >
          <div className="mx-auto flex items-center justify-between px-4 sm:px-6 h-14" style={{ maxWidth: '1200px' }}>
            <img
              src="/logo-sigma.png"
              alt="Sigma Factory"
              style={{ height: '36px', width: 'auto' }}
            />
            <button
              onClick={() => setMenuOpen(true)}
              className="flex flex-col items-center justify-center gap-1.5 w-9 h-9 transition-colors"
              style={{ borderRadius: '2px' }}
              aria-label="Ouvrir le menu"
            >
              <span className="block w-5" style={{ height: '1.5px', backgroundColor: '#C9A84C' }} />
              <span className="block w-5" style={{ height: '1.5px', backgroundColor: '#C9A84C' }} />
              <span className="block w-3.5 self-end" style={{ height: '1.5px', backgroundColor: '#C9A84C' }} />
            </button>
          </div>
        </header>

        {/* Nav menu */}
        <NavMenu
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          userEmail={userEmail}
        />

        {/* Main content */}
        <main className="mx-auto px-4 sm:px-6 py-6" style={{ maxWidth: '1200px' }}>
          {children}
        </main>
      </div>
    </CampaignProvider>
  )
}
