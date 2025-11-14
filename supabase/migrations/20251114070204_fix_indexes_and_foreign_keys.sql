/*
  # Fix Indexes and Foreign Keys

  ## Overview
  Optimize database indexes by removing redundant ones and adding missing foreign key indexes.
  
  ## Security Issues Addressed
  
  ### 1. Missing Foreign Key Index
  - Add index on `leaderboard_entries.user_id` foreign key for better join performance
  
  ### 2. Unused Index Cleanup
  - Remove `idx_leaderboard_game_session_id` - game_session_id already has FK index
  - Keep `idx_leaderboard_type_difficulty_time` - used by getLeaderboard() queries
  - Keep `idx_game_sessions_type_difficulty` - used for filtering game sessions
  - Remove `idx_statistics_type_difficulty` - covered by unique constraint index
  
  ## Indexes Kept (Used by Application)
  - `idx_game_sessions_user_id` - getUserGameSessions() queries
  - `idx_game_sessions_type_difficulty` - filtering by game type and difficulty
  - `idx_leaderboard_type_difficulty_time` - getLeaderboard() with ORDER BY
  - `idx_daily_challenges_date` - getDailyChallenge() queries
  - Foreign key indexes (auto-created)
  
  ## Impact
  - Improved query performance for user lookups in leaderboard
  - Reduced index maintenance overhead
  - Better query optimization by database planner
*/

-- Add missing foreign key index for leaderboard_entries.user_id
CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id 
ON leaderboard_entries(user_id);

-- Remove game_session_id index (foreign key already has index)
DROP INDEX IF EXISTS idx_leaderboard_game_session_id;

-- Remove statistics type/difficulty index (covered by unique constraint)
DROP INDEX IF EXISTS idx_statistics_type_difficulty;

-- Keep these indexes as they are actively used:
-- - idx_game_sessions_user_id: for getUserGameSessions(userId)
-- - idx_game_sessions_type_difficulty: for filtering sessions by type and difficulty
-- - idx_leaderboard_type_difficulty_time: for getLeaderboard(difficulty, gameType) ORDER BY
-- - idx_daily_challenges_date: for getDailyChallenge(date)
-- - idx_leaderboard_user_id: for joins with profiles table

-- Note: The unique constraint game_statistics_user_difficulty_type_key
-- automatically creates an index that covers lookups by (user_id, difficulty, game_type)