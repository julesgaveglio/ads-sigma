'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCampaignContext } from '@/contexts/CampaignContext'
import { IconDashboard, IconOptIn, IconPlay, IconTranscript, IconLeads, IconEmail, IconClose, IconLogout } from '@/components/icons'

interface NavMenuProps {
  isOpen: boolean
  onClose: () => void
  userEmail: string
}

const NAV_LINKS = [
  { href: '/', label: 'Dashboard', icon: <IconDashboard size={18} /> },
  { href: '/optin', label: 'Opt-in', icon: <IconOptIn size={18} /> },
  { href: '/vsl', label: 'VSL', icon: <IconPlay size={18} /> },
  { href: '/vsl/transcript', label: 'Transcript', icon: <IconTranscript size={18} /> },
  { href: '/leads', label: 'Leads', icon: <IconLeads size={18} /> },
  { href: '/emails', label: 'Emails', icon: <IconEmail size={18} /> },
]

export default function NavMenu({ isOpen, onClose, userEmail }: NavMenuProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { campaigns, activeCampaignId, setCampaignId, loading } =
    useCampaignContext()

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.replace('/login')
  }

  return (
    <>
      {/* Overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 transition-opacity"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={onClose}
        />
      )}

      {/* Slide-in panel */}
      <div
        className={`fixed top-0 right-0 h-full max-w-[90vw] z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          width: '340px',
          backgroundColor: '#111111',
          borderLeft: '1px solid #1E1E1E',
        }}
      >
        {/* Header */}
        <div className="p-5" style={{ borderBottom: '1px solid #1E1E1E' }}>
          <div className="flex items-center justify-between mb-4">
            <img
              src="/logo-sigma.png"
              alt="Sigma Factory"
              style={{ height: '28px', width: 'auto' }}
            />
            <button
              onClick={onClose}
              className="transition-colors flex items-center justify-center w-8 h-8"
              style={{ color: '#8A8580', borderRadius: '2px' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#F0EDE6')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#8A8580')}
            >
              <IconClose size={18} />
            </button>
          </div>
          <p className="truncate" style={{ fontSize: '12px', color: '#8A8580' }}>{userEmail}</p>
        </div>

        {/* Campaign selector */}
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #1E1E1E' }}>
          <label className="label-upper block mb-2">
            Campagne
          </label>
          {loading ? (
            <div className="h-10 animate-pulse" style={{ backgroundColor: '#1E1E1E', borderRadius: '2px' }} />
          ) : (
            <select
              value={activeCampaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              className="w-full px-3 py-2.5 text-sm focus:outline-none transition-colors appearance-none cursor-pointer"
              style={{
                backgroundColor: '#0A0A0A',
                border: '1px solid #1E1E1E',
                borderRadius: '2px',
                color: '#F0EDE6',
                fontFamily: "'Hanken Grotesk', sans-serif",
              }}
              onFocus={(e) => (e.target.style.borderColor = '#C9A84C')}
              onBlur={(e) => (e.target.style.borderColor = '#1E1E1E')}
            >
              <option value="all">Toutes les campagnes</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.end_date ? '\u25CF ' : '\u25CF '}{c.name}
                </option>
              ))}
            </select>
          )}
          {/* Campaign list with status dots */}
          {!loading && campaigns.length > 0 && (
            <div className="mt-3 space-y-1 max-h-40 overflow-y-auto">
              {campaigns.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setCampaignId(activeCampaignId === c.id ? 'all' : c.id)
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors"
                  style={{
                    borderRadius: '2px',
                    fontSize: '12px',
                    fontFamily: "'Hanken Grotesk', sans-serif",
                    color: activeCampaignId === c.id ? '#C9A84C' : '#8A8580',
                    backgroundColor: activeCampaignId === c.id ? 'rgba(201, 168, 76, 0.08)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (activeCampaignId !== c.id) {
                      e.currentTarget.style.color = '#F0EDE6'
                      e.currentTarget.style.backgroundColor = 'rgba(30, 30, 30, 0.5)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeCampaignId !== c.id) {
                      e.currentTarget.style.color = '#8A8580'
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <span className={c.end_date ? 'dot-inactive' : 'dot-active'} />
                  <span className="truncate">{c.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href
            return (
              <button
                key={link.href}
                onClick={() => {
                  router.push(link.href)
                  onClose()
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors"
                style={{
                  borderRadius: '2px',
                  fontFamily: "'Hanken Grotesk', sans-serif",
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: isActive ? '#F0EDE6' : '#8A8580',
                  borderLeft: isActive ? '1px solid #C9A84C' : '1px solid transparent',
                  backgroundColor: isActive ? 'rgba(201, 168, 76, 0.04)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#F0EDE6'
                    e.currentTarget.style.backgroundColor = 'rgba(30, 30, 30, 0.5)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#8A8580'
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <span className="w-5 flex items-center justify-center">{link.icon}</span>
                {link.label}
              </button>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-5" style={{ borderTop: '1px solid #1E1E1E' }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 transition-colors"
            style={{
              borderRadius: '2px',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontFamily: "'Hanken Grotesk', sans-serif",
              color: '#8A8580',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#C9A84C')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#8A8580')}
          >
            <IconLogout size={16} />
            Deconnexion
          </button>
        </div>
      </div>
    </>
  )
}
