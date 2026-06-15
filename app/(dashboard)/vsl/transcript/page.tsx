'use client'

import { useState, useEffect } from 'react'

interface TranscriptData {
  transcript_srt: string | null
  transcript_text: string | null
}

interface Paragraph {
  startTime: string
  text: string
}

const SRT_REGEX = /\d{2}:\d{2}:\d{2}[,.]\d{3}\s*-->/

function parseSrtToParagraphs(srt: string): Paragraph[] {
  const blocks = srt.trim().split(/\n\n+/)
  const paragraphs: Paragraph[] = []
  let currentParagraph: Paragraph | null = null
  let lastGroupSeconds = -1

  for (const block of blocks) {
    const lines = block.split('\n')
    if (lines.length < 2) continue

    const timeLine = lines.find((l) => SRT_REGEX.test(l))
    if (!timeLine) continue

    const match = timeLine.match(/(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/)
    if (!match) continue

    const totalSeconds =
      parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseInt(match[3])
    const groupSeconds = Math.floor(totalSeconds / 30) * 30

    const timeIdx = lines.indexOf(timeLine)
    const textLines = lines.slice(timeIdx + 1).filter((l) => l.trim())
    const text = textLines.join(' ')

    if (groupSeconds !== lastGroupSeconds) {
      const minutes = Math.floor(groupSeconds / 60)
      const secs = groupSeconds % 60
      currentParagraph = {
        startTime: `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
        text: text,
      }
      paragraphs.push(currentParagraph)
      lastGroupSeconds = groupSeconds
    } else if (currentParagraph) {
      currentParagraph.text += ' ' + text
    }
  }

  return paragraphs
}

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function plainTextToParagraphs(text: string): Paragraph[] {
  const words = text.split(/\s+/)
  const paragraphs: Paragraph[] = []
  const WORDS_PER_CHUNK = 50
  for (let i = 0; i < words.length; i += WORDS_PER_CHUNK) {
    const chunk = words.slice(i, i + WORDS_PER_CHUNK).join(' ')
    const estimatedSeconds = Math.floor((i / WORDS_PER_CHUNK) * 30)
    paragraphs.push({
      startTime: formatTimestamp(estimatedSeconds),
      text: chunk,
    })
  }
  return paragraphs
}

export default function TranscriptPage() {
  const [data, setData] = useState<TranscriptData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'srt' | 'text'>('text')
  const [editMode, setEditMode] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function fetchTranscript() {
      try {
        const res = await fetch('/api/vsl/transcript')
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchTranscript()
  }, [])

  async function handleSave() {
    setSaving(true)
    setError('')
    setSuccess('')

    const isSrt = SRT_REGEX.test(editValue)

    try {
      const res = await fetch('/api/vsl/transcript', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isSrt
            ? { transcript_srt: editValue }
            : { transcript_text: editValue }
        ),
      })

      if (res.ok) {
        const json = await res.json()
        setData(json)
        setEditMode(false)
        setSuccess('Transcript sauvegarde')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const err = await res.json()
        setError(err.error || 'Erreur de sauvegarde')
      }
    } catch {
      setError('Erreur reseau')
    } finally {
      setSaving(false)
    }
  }

  const hasSrt = !!data?.transcript_srt
  const hasText = !!data?.transcript_text

  const srtParagraphs = hasSrt ? parseSrtToParagraphs(data!.transcript_srt!) : []
  const textParagraphs = hasText ? plainTextToParagraphs(data!.transcript_text!) : []

  const paragraphs = tab === 'srt' && hasSrt ? srtParagraphs : textParagraphs

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
          Transcript VSL
        </h2>
        <div
          className="h-96 animate-pulse"
          style={{ backgroundColor: '#111111', border: '1px solid #1E1E1E', borderRadius: '2px' }}
        />
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
          Transcript VSL
        </h2>
        <button
          onClick={() => {
            if (editMode) {
              setEditMode(false)
            } else {
              setEditValue(
                tab === 'srt' && hasSrt
                  ? data!.transcript_srt!
                  : data?.transcript_text || ''
              )
              setEditMode(true)
            }
          }}
          style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#C9A84C',
            fontFamily: "'Hanken Grotesk', sans-serif",
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#D4B35A')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#C9A84C')}
        >
          {editMode ? 'Annuler' : 'Modifier'}
        </button>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 w-fit"
        style={{ backgroundColor: '#161616', borderRadius: '2px' }}
      >
        <button
          onClick={() => setTab('srt')}
          className="px-4 py-1.5 transition-colors"
          style={{
            borderRadius: '2px',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            fontFamily: "'Hanken Grotesk', sans-serif",
            color: tab === 'srt' ? '#C9A84C' : '#8A8580',
            backgroundColor: tab === 'srt' ? 'rgba(201, 168, 76, 0.1)' : 'transparent',
          }}
        >
          SRT
        </button>
        <button
          onClick={() => setTab('text')}
          className="px-4 py-1.5 transition-colors"
          style={{
            borderRadius: '2px',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            fontFamily: "'Hanken Grotesk', sans-serif",
            color: tab === 'text' ? '#C9A84C' : '#8A8580',
            backgroundColor: tab === 'text' ? 'rgba(201, 168, 76, 0.1)' : 'transparent',
          }}
        >
          Texte brut
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
      {success && (
        <div
          className="text-sm px-4 py-3"
          style={{
            backgroundColor: 'rgba(74, 122, 90, 0.1)',
            border: '1px solid rgba(74, 122, 90, 0.2)',
            borderRadius: '2px',
            color: '#4A7A5A',
          }}
        >
          {success}
        </div>
      )}

      {editMode ? (
        <div className="card space-y-4">
          <p style={{ fontSize: '11px', color: '#4A4642' }}>
            Collez le texte ci-dessous. Le format SRT est auto-detecte via les
            timestamps (ex: 00:01:23,456 --&gt;). Utilisez le format SRT pour
            un decoupage precis par timestamps.
          </p>
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            rows={20}
            className="w-full px-4 py-3 text-sm font-mono focus:outline-none resize-y"
            style={{
              backgroundColor: '#0D0D0D',
              border: '1px solid #1E1E1E',
              borderRadius: '2px',
              color: '#F0EDE6',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#C9A84C')}
            onBlur={(e) => (e.target.style.borderColor = '#1E1E1E')}
            placeholder="Collez votre transcript SRT ou texte brut ici..."
          />
          <div className="flex items-center justify-between">
            <span style={{ fontSize: '11px', color: '#4A4642' }}>
              {SRT_REGEX.test(editValue)
                ? 'Format detecte : SRT'
                : 'Format detecte : Texte brut'}
            </span>
            <button
              onClick={handleSave}
              disabled={saving || !editValue.trim()}
              className="btn btn-gold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      ) : paragraphs.length > 0 ? (
        <div className="card space-y-4">
          {paragraphs.map((p, i) => (
            <div key={i} className="flex gap-4">
              <span
                className="font-mono w-12 shrink-0 pt-0.5"
                style={{ fontSize: '11px', color: 'rgba(201, 168, 76, 0.6)' }}
              >
                {p.startTime}
              </span>
              <p style={{ fontSize: '13px', color: '#8A8580', lineHeight: 1.7 }}>{p.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center" style={{ padding: '48px 32px' }}>
          <p style={{ color: '#4A4642', marginBottom: '16px', fontSize: '13px' }}>Aucun transcript disponible</p>
          <button
            onClick={() => {
              setEditValue('')
              setEditMode(true)
            }}
            className="btn btn-gold"
          >
            Ajouter un transcript
          </button>
        </div>
      )}
    </div>
  )
}
