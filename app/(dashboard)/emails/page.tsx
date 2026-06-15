'use client'

import { useState, useEffect, useCallback } from 'react'
import { formatDate } from '@/lib/utils'
import type { EmailCampaignWithStats } from '@/types'

const PRESET_COLORS = [
  '#C9A84C', '#4A7A5A', '#8b5cf6', '#f59e0b', '#ef4444',
  '#3b82f6', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
]

interface NewCampaignForm {
  name: string
  subject: string
  body_html: string
  color: string
}

const EMPTY_FORM: NewCampaignForm = {
  name: '',
  subject: '',
  body_html: '',
  color: PRESET_COLORS[0],
}

export default function EmailsPage() {
  const [campaigns, setCampaigns] = useState<EmailCampaignWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState<NewCampaignForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{ subject: string; body_html: string; color: string }>({
    subject: '',
    body_html: '',
    color: '',
  })
  const [error, setError] = useState('')

  const fetchCampaigns = useCallback(async () => {
    try {
      const res = await fetch('/api/emails')
      if (res.ok) {
        const data = await res.json()
        setCampaigns(Array.isArray(data) ? data : data.campaigns || [])
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  async function handleCreate() {
    if (!form.name.trim() || !form.subject.trim()) return
    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        setForm(EMPTY_FORM)
        setShowCreate(false)
        fetchCampaigns()
      } else {
        const err = await res.json()
        setError(err.error || 'Erreur de creation')
      }
    } catch {
      setError('Erreur reseau')
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdate(id: string) {
    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/emails', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...editForm }),
      })

      if (res.ok) {
        setEditingId(null)
        fetchCampaigns()
      } else {
        const err = await res.json()
        setError(err.error || 'Erreur de mise a jour')
      }
    } catch {
      setError('Erreur reseau')
    } finally {
      setSaving(false)
    }
  }

  function startEdit(campaign: EmailCampaignWithStats) {
    setEditingId(campaign.id)
    setEditForm({
      subject: campaign.subject,
      body_html: campaign.body_html,
      color: campaign.color,
    })
  }

  const inputStyle = {
    backgroundColor: '#0D0D0D',
    border: '1px solid #1E1E1E',
    borderRadius: '2px',
    color: '#F0EDE6',
    fontFamily: "'Hanken Grotesk', sans-serif",
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '24px',
            fontWeight: 600,
            color: '#F0EDE6',
            letterSpacing: '0.04em',
          }}
        >
          Emails
        </h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse"
              style={{ backgroundColor: '#111111', border: '1px solid #1E1E1E', borderRadius: '2px' }}
            />
          ))}
        </div>
      </div>
    )
  }

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
          Emails
        </h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="btn btn-gold"
        >
          {showCreate ? 'Annuler' : 'Nouvelle campagne'}
        </button>
      </div>

      {error && (
        <div
          className="text-sm px-4 py-3"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.06)',
            border: '1px solid rgba(239, 68, 68, 0.15)',
            borderRadius: '2px',
            color: '#ef4444',
          }}
        >
          {error}
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <div className="card space-y-4">
          <h3 className="label-upper mb-1">Nouvelle campagne email</h3>
          <div className="gold-rule mb-4" />

          <div>
            <label className="label-upper block mb-2" style={{ color: '#8A8580' }}>Nom</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 text-sm focus:outline-none transition-colors"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = '#C9A84C')}
              onBlur={(e) => (e.target.style.borderColor = '#1E1E1E')}
              placeholder="Nom de la campagne"
            />
          </div>

          <div>
            <label className="label-upper block mb-2" style={{ color: '#8A8580' }}>Sujet</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full px-4 py-2.5 text-sm focus:outline-none transition-colors"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = '#C9A84C')}
              onBlur={(e) => (e.target.style.borderColor = '#1E1E1E')}
              placeholder="Sujet de l'email"
            />
          </div>

          <div>
            <label className="label-upper block mb-2" style={{ color: '#8A8580' }}>
              Contenu HTML
            </label>
            <textarea
              value={form.body_html}
              onChange={(e) => setForm({ ...form, body_html: e.target.value })}
              rows={8}
              className="w-full px-4 py-3 text-sm font-mono focus:outline-none resize-y transition-colors"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = '#C9A84C')}
              onBlur={(e) => (e.target.style.borderColor = '#1E1E1E')}
              placeholder="<p>Bonjour {{firstname}},</p>"
            />
            <p className="mt-1" style={{ fontSize: '11px', color: '#4A4642' }}>
              Utilisez {'{{firstname}}'} pour personnaliser
            </p>
          </div>

          <div>
            <label className="label-upper block mb-2" style={{ color: '#8A8580' }}>
              Couleur
            </label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setForm({ ...form, color: c })}
                  className="w-7 h-7 rounded-full border-2 transition-all"
                  style={{
                    backgroundColor: c,
                    borderColor: form.color === c ? '#F0EDE6' : 'transparent',
                    transform: form.color === c ? 'scale(1.1)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleCreate}
              disabled={saving || !form.name.trim() || !form.subject.trim()}
              className="btn btn-gold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Creation...' : 'Creer la campagne'}
            </button>
          </div>
        </div>
      )}

      {/* Campaign list */}
      {campaigns.length === 0 ? (
        <div className="card text-center" style={{ padding: '48px 32px' }}>
          <p style={{ color: '#4A4642', fontSize: '13px' }}>Aucune campagne email</p>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => {
            const isEditing = editingId === campaign.id

            return (
              <div
                key={campaign.id}
                className="relative overflow-hidden"
                style={{
                  backgroundColor: '#111111',
                  border: '1px solid #1E1E1E',
                  borderRadius: '2px',
                  padding: '24px 32px',
                  borderLeftWidth: '3px',
                  borderLeftColor: campaign.color,
                }}
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="label-upper block mb-2" style={{ color: '#8A8580' }}>
                        Sujet
                      </label>
                      <input
                        type="text"
                        value={editForm.subject}
                        onChange={(e) =>
                          setEditForm({ ...editForm, subject: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm focus:outline-none transition-colors"
                        style={inputStyle}
                        onFocus={(e) => (e.target.style.borderColor = '#C9A84C')}
                        onBlur={(e) => (e.target.style.borderColor = '#1E1E1E')}
                      />
                    </div>
                    <div>
                      <label className="label-upper block mb-2" style={{ color: '#8A8580' }}>
                        Contenu HTML
                      </label>
                      <textarea
                        value={editForm.body_html}
                        onChange={(e) =>
                          setEditForm({ ...editForm, body_html: e.target.value })
                        }
                        rows={6}
                        className="w-full px-3 py-2 text-sm font-mono focus:outline-none resize-y transition-colors"
                        style={inputStyle}
                        onFocus={(e) => (e.target.style.borderColor = '#C9A84C')}
                        onBlur={(e) => (e.target.style.borderColor = '#1E1E1E')}
                      />
                      <p className="mt-1" style={{ fontSize: '11px', color: '#4A4642' }}>
                        Utilisez {'{{firstname}}'} pour personnaliser
                      </p>
                    </div>
                    <div>
                      <label className="label-upper block mb-2" style={{ color: '#8A8580' }}>
                        Couleur
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {PRESET_COLORS.map((c) => (
                          <button
                            key={c}
                            onClick={() =>
                              setEditForm({ ...editForm, color: c })
                            }
                            className="w-6 h-6 rounded-full border-2 transition-all"
                            style={{
                              backgroundColor: c,
                              borderColor: editForm.color === c ? '#F0EDE6' : 'transparent',
                              transform: editForm.color === c ? 'scale(1.1)' : 'scale(1)',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-1.5 transition-colors"
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          color: '#8A8580',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#F0EDE6')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#8A8580')}
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => handleUpdate(campaign.id)}
                        disabled={saving}
                        className="btn btn-gold disabled:opacity-50"
                      >
                        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4
                          className="truncate"
                          style={{
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            fontSize: '16px',
                            fontWeight: 600,
                            color: '#F0EDE6',
                          }}
                        >
                          {campaign.name}
                        </h4>
                        <p className="mt-0.5 truncate" style={{ fontSize: '12px', color: '#8A8580' }}>
                          {campaign.subject}
                        </p>
                      </div>
                      <button
                        onClick={() => startEdit(campaign)}
                        className="shrink-0 transition-colors"
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color: '#C9A84C',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#D4B35A')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#C9A84C')}
                      >
                        Modifier
                      </button>
                    </div>

                    <div className="flex items-center gap-4 mt-3" style={{ fontSize: '11px', color: '#4A4642' }}>
                      <span>
                        {campaign.sends_count.toLocaleString('fr-FR')} envoi
                        {campaign.sends_count !== 1 ? 's' : ''}
                      </span>
                      <span>
                        {campaign.clicks_count.toLocaleString('fr-FR')} clic
                        {campaign.clicks_count !== 1 ? 's' : ''}
                      </span>
                      {campaign.last_sent && (
                        <span>
                          Dernier envoi : {formatDate(campaign.last_sent)}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
