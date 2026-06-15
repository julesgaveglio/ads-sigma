export const GOLD = '#C9A84C'

export const EXCLUDED_EMAILS = [
  'gavegliojules@gmail.com',
  'jules@vanzonexplorer.com',
]

export const VSL_CONFIG = {
  VIDEO_ID: 'a317c285-9b95-409a-97c3-9ae61edef884',
  get HLS_URL() {
    return `https://vz-bac05373-d10.b-cdn.net/${this.VIDEO_ID}/playlist.m3u8`
  },
  get CAPTIONS_URL() {
    return `https://vz-bac05373-d10.b-cdn.net/${this.VIDEO_ID}/captions/fr-auto.vtt`
  },
  CTA_DELAY_SECONDS: 420,
  MILESTONES: [25, 50, 75, 95] as const,
}

export const WATCH_TIME_COLORS = {
  hot: { threshold: 600, color: '#22c55e' },
  warm: { threshold: 180, color: '#f59e0b' },
  cold: { threshold: 0, color: '#6b7280' },
} as const

export const COOKIE_NAME = 'sigma_session'
export const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 // 30 days in seconds
