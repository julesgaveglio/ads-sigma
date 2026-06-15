// ─── Database types ─────────────────────────────────────────

export interface SigmaUser {
  id: string
  email: string
  password_hash: string
  role: 'admin' | 'viewer'
  created_at: string
}

export interface SigmaCampaign {
  id: string
  name: string
  start_date: string
  end_date: string | null
  budget_euros: number | null
  platform: string
  notes: string | null
  is_active: boolean
  created_at: string
}

export interface SigmaLead {
  id: string
  email: string
  firstname: string | null
  phone: string | null
  is_hot: boolean
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  utm_term: string | null
  created_at: string
}

export interface SigmaFunnelEvent {
  id: string
  session_id: string | null
  event: FunnelEventType
  page: string | null
  email: string | null
  firstname: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  utm_term: string | null
  referrer: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface SigmaVSLVersion {
  id: string
  name: string
  bunny_video_id: string
  bunny_library_id: string
  color: string
  is_active: boolean
  transcript_srt: string | null
  transcript_text: string | null
  hook_suggestions: unknown | null
  created_at: string
}

export interface SigmaEmailCampaign {
  id: string
  name: string
  subject: string
  body_html: string
  color: string
  created_at: string
}

export interface SigmaEmailSend {
  id: string
  email: string
  campaign_id: string
  campaign_name: string
  subject: string
  sent_at: string
}

export interface SigmaEmailClick {
  id: string
  email: string
  campaign_name: string
  clicked_at: string
}

// ─── Event types ────────────────────────────────────────────

export type FunnelEventType =
  | 'page_view'
  | 'optin'
  | 'vsl_view'
  | 'vsl_25'
  | 'vsl_50'
  | 'vsl_75'
  | 'vsl_100'
  | 'booking_start'
  | 'booking_confirmed'

// ─── API types ──────────────────────────────────────────────

export interface FunnelMetrics {
  funnel: Record<FunnelEventType, number>
  daily: Array<{ date: string } & Partial<Record<FunnelEventType, number>>>
  sources: Array<{ source: string; count: number }>
}

export interface OptinMetrics {
  views: number
  optins: number
  rate: number
}

export interface VSLStats {
  id: string
  name: string
  color: string
  viewers: number
  completions: number
  rate: number
}

export interface LeadEnriched extends SigmaLead {
  vsl_seconds: number
}

export interface EmailCampaignWithStats extends SigmaEmailCampaign {
  sends_count: number
  last_sent: string | null
  clicks_count: number
}

// ─── Auth ───────────────────────────────────────────────────

export interface SessionPayload {
  user_id: string
  email: string
  role: string
}
