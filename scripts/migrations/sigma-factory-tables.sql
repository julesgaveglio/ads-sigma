-- Sigma Factory — Migration SQL
-- A executer dans Supabase SQL Editor

-- 1. Utilisateurs dashboard
CREATE TABLE IF NOT EXISTS sigma_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Campagnes publicitaires
CREATE TABLE IF NOT EXISTS sigma_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  budget_euros NUMERIC,
  platform TEXT NOT NULL DEFAULT 'meta',
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Leads opt-in
CREATE TABLE IF NOT EXISTS sigma_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  firstname TEXT,
  phone TEXT,
  is_hot BOOLEAN NOT NULL DEFAULT false,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sigma_leads_email ON sigma_leads(email);
CREATE INDEX IF NOT EXISTS idx_sigma_leads_created_at ON sigma_leads(created_at);

-- 4. Tracking du tunnel
CREATE TABLE IF NOT EXISTS sigma_funnel_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  event TEXT NOT NULL,
  page TEXT,
  email TEXT,
  firstname TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  referrer TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sigma_funnel_events_event ON sigma_funnel_events(event);
CREATE INDEX IF NOT EXISTS idx_sigma_funnel_events_email ON sigma_funnel_events(email);
CREATE INDEX IF NOT EXISTS idx_sigma_funnel_events_session ON sigma_funnel_events(session_id);
CREATE INDEX IF NOT EXISTS idx_sigma_funnel_events_created_at ON sigma_funnel_events(created_at);

-- 5. Versions VSL
CREATE TABLE IF NOT EXISTS sigma_vsl_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bunny_video_id TEXT NOT NULL,
  bunny_library_id TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#B9945F',
  is_active BOOLEAN NOT NULL DEFAULT false,
  transcript_srt TEXT,
  transcript_text TEXT,
  hook_suggestions JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Campagnes email
CREATE TABLE IF NOT EXISTS sigma_email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '#B9945F',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Envois email
CREATE TABLE IF NOT EXISTS sigma_email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  campaign_id UUID REFERENCES sigma_email_campaigns(id),
  campaign_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sigma_email_sends_email ON sigma_email_sends(email);

-- 8. Clics email
CREATE TABLE IF NOT EXISTS sigma_email_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  campaign_name TEXT NOT NULL,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sigma_email_clicks_email ON sigma_email_clicks(email);

-- Seed: inserer la premiere version VSL
INSERT INTO sigma_vsl_versions (name, bunny_video_id, bunny_library_id, is_active)
VALUES ('VSL v1', 'a317c285-9b95-409a-97c3-9ae61edef884', 'bac05373-d10', true)
ON CONFLICT DO NOTHING;

-- Seed: compte admin dashboard
INSERT INTO sigma_users (email, password_hash, role)
VALUES (
  'jules@sigmaipf.fr',
  '96c5e4684919962eb3219b3456ed788587821fe7e69c3fbcb3f4e28f95565cd9',
  'admin'
)
ON CONFLICT (email) DO NOTHING;
