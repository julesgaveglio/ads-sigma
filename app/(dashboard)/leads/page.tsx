'use client'

import { useState, useEffect, useCallback } from 'react'
import { WATCH_TIME_COLORS } from '@/lib/constants'
import { formatDate, formatSeconds } from '@/lib/utils'
import { IconSearch, IconTrash } from '@/components/icons'
import type { LeadEnriched } from '@/types'

interface LeadsResponse {
  leads: LeadEnriched[]
  total: number
  page: number
  per_page: number
}

function getWatchTimeColor(seconds: number): string {
  if (seconds >= WATCH_TIME_COLORS.hot.threshold) return WATCH_TIME_COLORS.hot.color
  if (seconds >= WATCH_TIME_COLORS.warm.threshold) return WATCH_TIME_COLORS.warm.color
  return WATCH_TIME_COLORS.cold.color
}

export default function LeadsPage() {
  const [data, setData] = useState<LeadsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const perPage = 50

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(perPage),
      })
      if (search.trim()) params.set('search', search.trim())

      const res = await fetch(`/api/leads?${params}`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads()
    }, search ? 400 : 0)
    return () => clearTimeout(timer)
  }, [fetchLeads, search])

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      const res = await fetch('/api/leads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        setData((prev) =>
          prev
            ? {
                ...prev,
                leads: prev.leads.filter((l) => l.id !== id),
                total: prev.total - 1,
              }
            : null
        )
      }
    } catch {
      // silently fail
    } finally {
      setDeleting(null)
      setConfirmDelete(null)
    }
  }

  const totalPages = data ? Math.ceil(data.total / perPage) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '24px',
            fontWeight: 600,
            color: '#F0EDE6',
            letterSpacing: '0.04em',
          }}
        >
          Leads
        </h2>
        {data && (
          <span style={{ fontSize: '12px', color: '#8A8580' }}>
            {data.total.toLocaleString('fr-FR')} lead{data.total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: '#4A4642' }}
        >
          <IconSearch size={16} />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          placeholder="Rechercher par email, prenom ou telephone..."
          className="w-full pl-9 pr-4 py-2.5 text-sm focus:outline-none transition-colors"
          style={{
            backgroundColor: '#0D0D0D',
            border: '1px solid #1E1E1E',
            borderRadius: '2px',
            color: '#F0EDE6',
            fontFamily: "'Hanken Grotesk', sans-serif",
          }}
          onFocus={(e) => (e.target.style.borderColor = '#C9A84C')}
          onBlur={(e) => (e.target.style.borderColor = '#1E1E1E')}
        />
      </div>

      {/* Table */}
      <div
        className="overflow-hidden"
        style={{
          backgroundColor: '#111111',
          border: '1px solid #1E1E1E',
          borderRadius: '2px',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #1E1E1E' }}>
                <th className="text-left px-4 py-3 label-upper" style={{ color: '#C9A84C' }}>
                  Prenom
                </th>
                <th className="text-left px-4 py-3 label-upper" style={{ color: '#C9A84C' }}>
                  Email
                </th>
                <th className="text-left px-4 py-3 label-upper hidden sm:table-cell" style={{ color: '#C9A84C' }}>
                  Telephone
                </th>
                <th className="text-left px-4 py-3 label-upper" style={{ color: '#C9A84C' }}>
                  Watch Time
                </th>
                <th className="text-left px-4 py-3 label-upper hidden md:table-cell" style={{ color: '#C9A84C' }}>
                  Source
                </th>
                <th className="text-left px-4 py-3 label-upper hidden lg:table-cell" style={{ color: '#C9A84C' }}>
                  Date
                </th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {loading && !data ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(30, 30, 30, 0.5)' }}>
                    <td colSpan={7} className="px-4 py-3">
                      <div className="h-4 animate-pulse" style={{ backgroundColor: '#1E1E1E', borderRadius: '2px' }} />
                    </td>
                  </tr>
                ))
              ) : data && data.leads.length > 0 ? (
                data.leads.map((lead) => {
                  const wtColor = getWatchTimeColor(lead.vsl_seconds)
                  return (
                    <tr
                      key={lead.id}
                      className="transition-colors"
                      style={{ borderBottom: '1px solid rgba(30, 30, 30, 0.5)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(30, 30, 30, 0.3)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td className="px-4 py-3" style={{ color: '#F0EDE6', fontWeight: 500 }}>
                        {lead.firstname || '-'}
                      </td>
                      <td className="px-4 py-3" style={{ color: '#8A8580' }}>
                        <span className="truncate block max-w-[200px]">
                          {lead.email}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell" style={{ color: '#4A4642' }}>
                        {lead.phone || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5"
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            borderRadius: '2px',
                            color: wtColor,
                            backgroundColor: `${wtColor}15`,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: wtColor }}
                          />
                          {formatSeconds(lead.vsl_seconds)}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell" style={{ fontSize: '11px', color: '#4A4642' }}>
                        {lead.utm_source || 'direct'}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell" style={{ fontSize: '11px', color: '#4A4642' }}>
                        {formatDate(lead.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        {confirmDelete === lead.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(lead.id)}
                              disabled={deleting === lead.id}
                              className="disabled:opacity-50"
                              style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                              {deleting === lead.id ? '...' : 'Oui'}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              style={{ fontSize: '11px', color: '#4A4642', background: 'none', border: 'none', cursor: 'pointer' }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = '#F0EDE6')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = '#4A4642')}
                            >
                              Non
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(lead.id)}
                            className="transition-colors flex items-center justify-center"
                            style={{ color: '#4A4642', background: 'none', border: 'none', cursor: 'pointer' }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#4A4642')}
                            title="Supprimer"
                          >
                            <IconTrash size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center"
                    style={{ color: '#4A4642', fontSize: '13px' }}
                  >
                    Aucun lead trouve
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span style={{ fontSize: '11px', color: '#4A4642' }}>
            Page {page} sur {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                border: '1px solid #1E1E1E',
                borderRadius: '2px',
                color: '#8A8580',
                backgroundColor: 'transparent',
                fontFamily: "'Hanken Grotesk', sans-serif",
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#F0EDE6'
                e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#8A8580'
                e.currentTarget.style.borderColor = '#1E1E1E'
              }}
            >
              Precedent
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                border: '1px solid #1E1E1E',
                borderRadius: '2px',
                color: '#8A8580',
                backgroundColor: 'transparent',
                fontFamily: "'Hanken Grotesk', sans-serif",
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#F0EDE6'
                e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#8A8580'
                e.currentTarget.style.borderColor = '#1E1E1E'
              }}
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
