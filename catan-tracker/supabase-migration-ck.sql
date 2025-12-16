-- ============================================
-- CITIES & KNIGHTS MIGRATION
-- Run this to add C&K support to an existing database
-- ============================================

-- Add Cities & Knights columns to match_participants
ALTER TABLE match_participants 
ADD COLUMN IF NOT EXISTS trade_level INTEGER NOT NULL DEFAULT 0 CHECK (trade_level >= 0 AND trade_level <= 5);

ALTER TABLE match_participants 
ADD COLUMN IF NOT EXISTS politics_level INTEGER NOT NULL DEFAULT 0 CHECK (politics_level >= 0 AND politics_level <= 5);

ALTER TABLE match_participants 
ADD COLUMN IF NOT EXISTS science_level INTEGER NOT NULL DEFAULT 0 CHECK (science_level >= 0 AND science_level <= 5);

ALTER TABLE match_participants 
ADD COLUMN IF NOT EXISTS has_trade_metropolis BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE match_participants 
ADD COLUMN IF NOT EXISTS has_politics_metropolis BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE match_participants 
ADD COLUMN IF NOT EXISTS has_science_metropolis BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE match_participants 
ADD COLUMN IF NOT EXISTS has_defender BOOLEAN NOT NULL DEFAULT FALSE;

-- Add unique constraints for metropolis (only one holder per match)
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_trade_metropolis 
  ON match_participants(match_id) 
  WHERE has_trade_metropolis = TRUE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_one_politics_metropolis 
  ON match_participants(match_id) 
  WHERE has_politics_metropolis = TRUE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_one_science_metropolis 
  ON match_participants(match_id) 
  WHERE has_science_metropolis = TRUE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_one_defender 
  ON match_participants(match_id) 
  WHERE has_defender = TRUE;
