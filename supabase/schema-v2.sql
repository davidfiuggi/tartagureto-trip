-- Tartagureto Trip v2 - Predefined voting model
-- Run this in Supabase SQL Editor AFTER schema.sql

-- Drop old tables (proposals-based voting)
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS proposals CASCADE;

-- New votes table: toggle-based voting on predefined options
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('destination', 'budget', 'weekend_type', 'month')),
  option_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(trip_id, member_id, category, option_id)
);

-- RLS
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "votes_all" ON votes FOR ALL USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX idx_votes_trip ON votes(trip_id);
CREATE INDEX idx_votes_trip_category ON votes(trip_id, category);
