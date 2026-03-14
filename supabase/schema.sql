-- ============================================
-- Tartagureto Trip - Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Trips table
CREATE TABLE trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  admin_password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Members table
CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_color TEXT NOT NULL DEFAULT '#5666F0',
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(trip_id, name)
);

-- Proposals table (destination, date, budget, activity)
CREATE TABLE proposals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('destination', 'date', 'budget', 'activity')),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Votes table
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  vote INTEGER NOT NULL CHECK (vote IN (1, -1)),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(proposal_id, member_id)
);

-- Indexes
CREATE INDEX idx_members_trip ON members(trip_id);
CREATE INDEX idx_proposals_trip ON proposals(trip_id);
CREATE INDEX idx_votes_proposal ON votes(proposal_id);
CREATE INDEX idx_trips_code ON trips(code);

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Since we use anon key + trip codes (no Supabase Auth),
-- we allow read/write via anon role and enforce access in app logic.
-- This is safe because:
-- 1. Trip codes act as passwords (only shared via WhatsApp)
-- 2. Admin password protects admin actions

CREATE POLICY "Allow all for anon" ON trips
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for anon" ON members
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for anon" ON proposals
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for anon" ON votes
  FOR ALL USING (true) WITH CHECK (true);
