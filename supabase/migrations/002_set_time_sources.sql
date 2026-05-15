-- FestFlow Set Time Accuracy System

-- Enum for source types
CREATE TYPE source_type AS ENUM ('official_html', 'official_image', 'bandsintown', 'songkick');

-- Raw scraped data from each source
CREATE TABLE set_time_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE NOT NULL,
  source_type source_type NOT NULL,
  source_url TEXT NOT NULL,
  raw_data JSONB NOT NULL,
  scraped_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Discrepancies flagged for admin review
CREATE TABLE set_time_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE NOT NULL,
  artist_name TEXT NOT NULL,
  stage TEXT,
  day DATE NOT NULL,
  field TEXT NOT NULL CHECK (field IN ('start_time', 'end_time', 'stage')),
  values JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved')),
  resolved_value TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Scrape job tracking
CREATE TABLE scrape_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE NOT NULL,
  source_type source_type NOT NULL,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  sets_found INTEGER DEFAULT 0
);

-- Track which sources confirmed each set
ALTER TABLE sets ADD COLUMN sources JSONB DEFAULT '[]';

-- Indexes
CREATE INDEX idx_set_time_sources_festival ON set_time_sources(festival_id, source_type);
CREATE INDEX idx_set_time_reviews_pending ON set_time_reviews(festival_id, status) WHERE status = 'pending';
CREATE INDEX idx_scrape_jobs_festival ON scrape_jobs(festival_id, status);
