'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { VSL_CONFIG } from '@/lib/constants'

interface Caption {
  start: number
  end: number
  text: string
}

function parseVTT(vtt: string): Caption[] {
  const captions: Caption[] = []
  const blocks = vtt.split(/\n\n+/)
  for (const block of blocks) {
    const lines = block.trim().split('\n')
    const timeLine = lines.find((l) => l.includes('-->'))
    if (!timeLine) continue
    const [startStr, endStr] = timeLine.split('-->')
    const start = parseTimestamp(startStr.trim())
    const end = parseTimestamp(endStr.trim())
    const textLines = lines.slice(lines.indexOf(timeLine) + 1)
    const text = textLines
      .join(' ')
      .replace(/<[^>]+>/g, '')
      .trim()
    if (text) captions.push({ start, end, text })
  }
  return captions
}

function parseTimestamp(ts: string): number {
  const parts = ts.split(':')
  if (parts.length === 3) {
    const [h, m, s] = parts
    return parseFloat(h) * 3600 + parseFloat(m) * 60 + parseFloat(s.replace(',', '.'))
  }
  if (parts.length === 2) {
    const [m, s] = parts
    return parseFloat(m) * 60 + parseFloat(s.replace(',', '.'))
  }
  return 0
}

async function trackEvent(
  event: string,
  metadata?: Record<string, unknown>
) {
  try {
    let email: string | null = null
    let firstname: string | null = null
    const stored = localStorage.getItem('sigma_funnel')
    if (stored) {
      const parsed = JSON.parse(stored)
      email = parsed.email ?? null
      firstname = parsed.firstname ?? null
    }
    await fetch('/api/funnel/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, email, firstname, metadata }),
    })
  } catch {
    // Silent fail — analytics should never break UX
  }
}

export default function VSLPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const maxWatchedRef = useRef(0)
  const sentMilestonesRef = useRef(new Set<number>())
  const hasTrackedViewRef = useRef(false)

  const [isPlaying, setIsPlaying] = useState(false)
  const [showCTA, setShowCTA] = useState(false)
  const [currentCaption, setCurrentCaption] = useState('')
  const [captions, setCaptions] = useState<Caption[]>([])

  // Load HLS
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let hls: import('hls.js').default | null = null

    async function init() {
      const Hls = (await import('hls.js')).default
      if (!video) return

      if (Hls.isSupported()) {
        hls = new Hls({
          startLevel: -1,
          capLevelToPlayerSize: true,
        })
        hls.loadSource(VSL_CONFIG.HLS_URL)
        hls.attachMedia(video)
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS
        video.src = VSL_CONFIG.HLS_URL
      }
    }

    init()

    return () => {
      if (hls) hls.destroy()
    }
  }, [])

  // Load captions
  useEffect(() => {
    fetch(VSL_CONFIG.CAPTIONS_URL)
      .then((r) => r.text())
      .then((text) => setCaptions(parseVTT(text)))
      .catch(() => {})
  }, [])

  // Time update handler
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    const t = video.currentTime
    const dur = video.duration

    // Update max watched
    if (t > maxWatchedRef.current) {
      maxWatchedRef.current = t
    }

    // CTA after delay
    if (t >= VSL_CONFIG.CTA_DELAY_SECONDS && !showCTA) {
      setShowCTA(true)
    }

    // Captions
    const active = captions.find((c) => t >= c.start && t <= c.end)
    setCurrentCaption(active?.text ?? '')

    // Milestone tracking
    if (dur > 0) {
      const pct = (t / dur) * 100
      for (const milestone of VSL_CONFIG.MILESTONES) {
        if (pct >= milestone && !sentMilestonesRef.current.has(milestone)) {
          sentMilestonesRef.current.add(milestone)
          const eventName = milestone === 95 ? 'vsl_100' : `vsl_${milestone}`
          trackEvent(eventName, {
            seconds: Math.round(t),
            vsl_version_id: VSL_CONFIG.VIDEO_ID,
          })
        }
      }
    }
  }, [captions, showCTA])

  // Seek blocking
  const handleSeeking = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.currentTime > maxWatchedRef.current + 2) {
      video.currentTime = maxWatchedRef.current
    }
  }, [])

  // Play/Pause handlers
  const handlePlay = useCallback(() => {
    setIsPlaying(true)
    if (!hasTrackedViewRef.current) {
      hasTrackedViewRef.current = true
      trackEvent('vsl_view', { vsl_version_id: VSL_CONFIG.VIDEO_ID })
    }
  }, [])

  const handlePause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  function togglePlay() {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }

  return (
    <div className="relative">
      {/* Video container */}
      <div className="vsl-container" onClick={togglePlay}>
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-contain"
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onSeeking={handleSeeking}
          onPlay={handlePlay}
          onPause={handlePause}
        />

        {/* Play overlay */}
        {!isPlaying && (
          <div
            className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer"
            style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
          >
            <div
              className="flex items-center justify-center transition-transform duration-300 hover:scale-105"
              style={{
                width: 72,
                height: 72,
                borderRadius: 2,
                backgroundColor: '#C9A84C',
              }}
            >
              <svg
                className="ml-0.5"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="#0A0A0A"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Captions overlay */}
        {currentCaption && (
          <div className="vsl-captions pointer-events-none z-20">
            {currentCaption}
          </div>
        )}
      </div>

      {/* CTA button — appears after 7 min */}
      {showCTA && (
        <div className="mt-6 animate-cta-enter">
          <a
            href="#booking"
            className="btn btn-gold block w-full text-center"
          >
            Reserver mon appel strategique gratuit
          </a>
        </div>
      )}

      <style jsx>{`
        @keyframes cta-enter {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-cta-enter {
          animation: cta-enter 0.6s ease-out both;
        }
      `}</style>
    </div>
  )
}
