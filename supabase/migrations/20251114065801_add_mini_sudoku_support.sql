/*
  # Add Mini Sudoku Support to Database

  ## Overview
  Adds support for Mini Sudoku (3x3) variant to the game tracking system.
  
  ## Changes Made

  ### 1. Add game_type Column
  - Add `game_type` column to `game_sessions` table (default: 'standard')
  - Possible values: 'standard' (9x9 Sudoku), 'mini' (3x3 Mini Sudoku)
  
  ### 2. Add game_type Column to Related Tables
  - Add `game_type` to `game_statistics` table
  - Add `game_type` to `leaderboard_entries` table
  - Add `game_type` to `daily_challenges` table
  
  ### 3. Update Indexes
  - Add composite indexes for game_type + difficulty queries
  
  ### 4. Update Statistics Unique Constraint
  - Update unique constraint to include game_type
  
  ## Impact
  - Existing records will default to 'standard' game type
  - Leaderboards can now be filtered by game type
  - Statistics track both game types separately
*/

-- Add game_type column to game_sessions
ALTER TABLE game_sessions 
ADD COLUMN IF NOT EXISTS game_type text DEFAULT 'standard' NOT NULL;

-- Add game_type column to game_statistics
ALTER TABLE game_statistics 
ADD COLUMN IF NOT EXISTS game_type text DEFAULT 'standard' NOT NULL;

-- Add game_type column to leaderboard_entries
ALTER TABLE leaderboard_entries 
ADD COLUMN IF NOT EXISTS game_type text DEFAULT 'standard' NOT NULL;

-- Add game_type column to daily_challenges
ALTER TABLE daily_challenges 
ADD COLUMN IF NOT EXISTS game_type text DEFAULT 'standard' NOT NULL;

-- Update the unique constraint on game_statistics to include game_type
-- First drop the existing constraint
ALTER TABLE game_statistics 
DROP CONSTRAINT IF EXISTS game_statistics_user_id_difficulty_key;

-- Create new unique constraint with game_type
ALTER TABLE game_statistics 
ADD CONSTRAINT game_statistics_user_difficulty_type_key 
UNIQUE (user_id, difficulty, game_type);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_game_sessions_type_difficulty 
ON game_sessions(game_type, difficulty);

CREATE INDEX IF NOT EXISTS idx_leaderboard_type_difficulty_time 
ON leaderboard_entries(game_type, difficulty, completion_time);

CREATE INDEX IF NOT EXISTS idx_statistics_type_difficulty 
ON game_statistics(game_type, difficulty);

-- Add check constraints to ensure valid game_type values
ALTER TABLE game_sessions 
ADD CONSTRAINT game_sessions_type_check 
CHECK (game_type IN ('standard', 'mini'));

ALTER TABLE game_statistics 
ADD CONSTRAINT game_statistics_type_check 
CHECK (game_type IN ('standard', 'mini'));

ALTER TABLE leaderboard_entries 
ADD CONSTRAINT leaderboard_entries_type_check 
CHECK (game_type IN ('standard', 'mini'));

ALTER TABLE daily_challenges 
ADD CONSTRAINT daily_challenges_type_check 
CHECK (game_type IN ('standard', 'mini'));