-- FestFlow Database Schema

-- Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  username TEXT
);

-- Festivals
CREATE TABLE festivals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  location TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  map_url TEXT
);

-- Sets
CREATE TABLE sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE NOT NULL,
  artist_name TEXT NOT NULL,
  stage TEXT NOT NULL,
  day DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL
);

-- User Schedules
CREATE TABLE user_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  set_id UUID REFERENCES sets(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(user_id, set_id)
);

-- Row Level Security
ALTER TABLE user_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own schedule"
  ON user_schedules FOR ALL
  USING (auth.uid() = user_id);

-- Indexes for common queries
CREATE INDEX idx_sets_festival_day ON sets(festival_id, day);
CREATE INDEX idx_user_schedules_user ON user_schedules(user_id);

-- Storage bucket for schedule uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('schedule-uploads', 'schedule-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: anyone can upload, only owner can delete
CREATE POLICY "Anyone can upload schedules"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'schedule-uploads');

CREATE POLICY "Anyone can view schedule uploads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'schedule-uploads');
