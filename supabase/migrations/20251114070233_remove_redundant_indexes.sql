/*
  # Remove Redundant Indexes

  ## Overview
  Clean up redundant indexes that are no longer needed or are covered by other indexes.
  
  ## Changes
  
  ### Indexes to Remove
  1. `idx_game_statistics_user_difficulty` - Redundant because:
     - The unique constraint `game_statistics_user_difficulty_type_key` on (user_id, difficulty, game_type)
     - Already provides an index that covers (user_id, difficulty) lookups
     - PostgreSQL can use the left prefix of composite indexes
  
  2. `idx_leaderboard_difficulty_time` - Redundant because:
     - Replaced by `idx_leaderboard_type_difficulty_time` on (game_type, difficulty, completion_time)
     - All queries now filter by game_type, so the old index is not used
  
  ### Indexes Kept (Essential for Performance)
  - `idx_game_sessions_user_id` - For getUserGameSessions(userId) queries
  - `idx_game_sessions_type_difficulty` - For filtering sessions by game type + difficulty
  - `idx_leaderboard_type_difficulty_time` - For getLeaderboard() with ORDER BY completion_time
  - `idx_leaderboard_user_id` - For joining with profiles table
  - `idx_daily_challenges_date` - For getDailyChallenge(date) lookups
  - `game_statistics_user_difficulty_type_key` - Unique constraint index (covers all lookups)
  
  ## Impact
  - Reduces storage overhead
  - Improves write performance (fewer indexes to maintain)
  - Simplifies query planning
*/

-- Remove old difficulty/time index (replaced by type/difficulty/time index)
DROP INDEX IF EXISTS idx_leaderboard_difficulty_time;

-- Remove redundant user/difficulty index (covered by unique constraint)
DROP INDEX IF EXISTS idx_game_statistics_user_difficulty;

-- Verify remaining indexes are optimal for our query patterns
COMMENT ON INDEX idx_game_sessions_user_id IS 'Used by getUserGameSessions(userId) - filters incomplete games by user';
COMMENT ON INDEX idx_game_sessions_type_difficulty IS 'Used for filtering game sessions by game type and difficulty';
COMMENT ON INDEX idx_leaderboard_type_difficulty_time IS 'Used by getLeaderboard(difficulty, gameType) with ORDER BY completion_time';
COMMENT ON INDEX idx_leaderboard_user_id IS 'Foreign key index - improves joins with profiles table';
COMMENT ON INDEX idx_daily_challenges_date IS 'Used by getDailyChallenge(date) for daily challenge lookups';