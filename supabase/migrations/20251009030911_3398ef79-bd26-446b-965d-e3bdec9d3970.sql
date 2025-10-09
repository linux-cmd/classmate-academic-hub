-- Google Calendar Integration Tables

-- Store per-user Google OAuth tokens
CREATE TABLE IF NOT EXISTS public.google_tokens (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  scope TEXT NOT NULL,
  token_type TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Store connected Google calendars and sync state
CREATE TABLE IF NOT EXISTS public.google_calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  gcal_id TEXT NOT NULL,
  summary TEXT,
  time_zone TEXT,
  selected BOOLEAN DEFAULT TRUE,
  sync_token TEXT,
  watch_channel_id TEXT,
  watch_resource_id TEXT,
  watch_expiration TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, gcal_id)
);

-- Map local events to Google Calendar events
CREATE TABLE IF NOT EXISTS public.google_event_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  local_event_id UUID NOT NULL,
  gcal_id TEXT NOT NULL,
  gcal_event_id TEXT NOT NULL,
  etag TEXT,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, gcal_id, gcal_event_id)
);

-- Enable RLS on all tables
ALTER TABLE public.google_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_event_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for google_tokens
CREATE POLICY "Users can manage their own Google tokens"
ON public.google_tokens
FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies for google_calendars
CREATE POLICY "Users can manage their own Google calendars"
ON public.google_calendars
FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies for google_event_links
CREATE POLICY "Users can manage their own Google event links"
ON public.google_event_links
FOR ALL
USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_google_calendars_user_id ON public.google_calendars(user_id);
CREATE INDEX IF NOT EXISTS idx_google_event_links_user_id ON public.google_event_links(user_id);
CREATE INDEX IF NOT EXISTS idx_google_event_links_local_event ON public.google_event_links(local_event_id);

-- Add source column to events table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'events' 
    AND column_name = 'source'
  ) THEN
    ALTER TABLE public.events ADD COLUMN source TEXT DEFAULT 'local';
  END IF;
END $$;