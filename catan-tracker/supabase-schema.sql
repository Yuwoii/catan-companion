-- ============================================
-- CATAN COMPANION - SUPABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- https://app.supabase.com/project/_/sql
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PLAYERS TABLE
-- Stores all players in your Catan group
-- ============================================
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  preferred_color VARCHAR(7) NOT NULL DEFAULT '#E74C3C',  -- Hex color (e.g., #E74C3C)
  avatar_seed VARCHAR(100),  -- Seed for generating DiceBear avatar
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick name lookups
CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);

-- ============================================
-- MATCHES TABLE
-- Stores each game session
-- ============================================
DO $$ BEGIN
  CREATE TYPE expansion_type AS ENUM ('base', 'seafarers', 'cities_knights', 'seafarers_cities_knights');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  expansion expansion_type NOT NULL DEFAULT 'base',
  target_vp INTEGER NOT NULL DEFAULT 10 CHECK (target_vp >= 5 AND target_vp <= 20),
  winner_id UUID REFERENCES players(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for active games and history queries
CREATE INDEX IF NOT EXISTS idx_matches_active ON matches(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_matches_ended ON matches(ended_at DESC) WHERE ended_at IS NOT NULL;

-- ============================================
-- MATCH PARTICIPANTS (Junction Table)
-- Links players to matches with their scores
-- ============================================
CREATE TABLE IF NOT EXISTS match_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0),
  has_longest_road BOOLEAN NOT NULL DEFAULT FALSE,
  has_largest_army BOOLEAN NOT NULL DEFAULT FALSE,
  turn_order INTEGER NOT NULL CHECK (turn_order >= 1 AND turn_order <= 6),
  
  UNIQUE(match_id, player_id),
  UNIQUE(match_id, turn_order)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_participants_match ON match_participants(match_id);
CREATE INDEX IF NOT EXISTS idx_participants_player ON match_participants(player_id);

-- ============================================
-- CONSTRAINTS: Only one player can hold each special card per match
-- These prevent multiple players from having Longest Road or Largest Army
-- ============================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_longest_road 
  ON match_participants(match_id) 
  WHERE has_longest_road = TRUE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_one_largest_army 
  ON match_participants(match_id) 
  WHERE has_largest_army = TRUE;

-- ============================================
-- PLAYER STATS VIEW
-- Aggregated statistics for leaderboard
-- ============================================
CREATE OR REPLACE VIEW player_stats AS
SELECT 
  p.id,
  p.name,
  p.preferred_color,
  p.avatar_seed,
  COUNT(mp.id) AS games_played,
  COUNT(CASE WHEN m.winner_id = p.id THEN 1 END) AS wins,
  ROUND(
    CASE 
      WHEN COUNT(mp.id) > 0 
      THEN (COUNT(CASE WHEN m.winner_id = p.id THEN 1 END)::NUMERIC / COUNT(mp.id)) * 100 
      ELSE 0 
    END, 1
  ) AS win_rate,
  ROUND(COALESCE(AVG(mp.score), 0), 1) AS avg_score,
  COUNT(CASE WHEN mp.has_longest_road THEN 1 END) AS longest_road_count,
  COUNT(CASE WHEN mp.has_largest_army THEN 1 END) AS largest_army_count
FROM players p
LEFT JOIN match_participants mp ON p.id = mp.player_id
LEFT JOIN matches m ON mp.match_id = m.id AND m.ended_at IS NOT NULL
GROUP BY p.id, p.name, p.preferred_color, p.avatar_seed;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- Since this is a trusted friends-only app, we allow public access
-- ============================================

-- Enable RLS on all tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_participants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running script)
DROP POLICY IF EXISTS "Allow all for anon players" ON players;
DROP POLICY IF EXISTS "Allow all for anon matches" ON matches;
DROP POLICY IF EXISTS "Allow all for anon participants" ON match_participants;

-- Create permissive policies for anonymous users
CREATE POLICY "Allow all for anon players" ON players 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow all for anon matches" ON matches 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow all for anon participants" ON match_participants 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- Enable realtime updates for live game tracking
-- ============================================
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE match_participants;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE matches;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE players;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- HELPER FUNCTION: Update timestamp
-- Automatically updates updated_at on player changes
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for players table
DROP TRIGGER IF EXISTS update_players_updated_at ON players;
CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (Optional - uncomment to add test players)
-- ============================================
-- INSERT INTO players (name, preferred_color, avatar_seed) VALUES
--   ('Alice', '#E74C3C', 'alice-catan'),
--   ('Bob', '#3498DB', 'bob-catan'),
--   ('Charlie', '#F39C12', 'charlie-catan'),
--   ('Diana', '#27AE60', 'diana-catan');
