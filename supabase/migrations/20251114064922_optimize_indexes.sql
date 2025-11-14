/*
  # Optimize Database Indexes

  ## Overview
  Remove redundant indexes and keep only those that are actually used by the application's queries.
  
  ## Analysis of Current Indexes
  
  ### Indexes to Keep (Used by Application Queries)
  1. `idx_game_sessions_user_id` - Used by getUserGameSessions() to fetch user's games
  2. `idx_game_statistics_user_difficulty` - Used by getOrCreateStatistics() for unique constraint lookups
  3. `idx_daily_challenges_date` - Used by getDailyChallenge() to fetch challenges by date
  4. `idx_leaderboard_difficulty_time` - Used by getLeaderboard() for sorting/filtering
  5. `idx_leaderboard_game_session_id` - Foreign key index for joins and cascades
  
  ### Indexes to Remove (Not Used by Current Query Patterns)
  1. `idx_game_sessions_is_completed` - Not used in WHERE clauses (we filter in application)
  2. `idx_game_sessions_difficulty` - Not queried independently
  3. `idx_game_sessions_daily_challenge` - Overly specific, not used
  4. `idx_leaderboard_daily_challenge` - getDailyChallengeLeaderboard uses date directly
  5. `idx_leaderboard_user_id` - Not querying by user_id alone in leaderboard queries
  
  ## Changes
  - Drop 5 unused indexes to reduce storage overhead and improve write performance
  - Keep essential indexes for actual query patterns
*/

-- Remove unused indexes that don't match our query patterns
DROP INDEX IF EXISTS idx_game_sessions_is_completed;
DROP INDEX IF EXISTS idx_game_sessions_difficulty;
DROP INDEX IF EXISTS idx_game_sessions_daily_challenge;
DROP INDEX IF EXISTS idx_leaderboard_daily_challenge;
DROP INDEX IF EXISTS idx_leaderboard_user_id;

-- Note: The following indexes are kept as they are actively used:
-- - idx_game_sessions_user_id: Used for getUserGameSessions(userId)
-- - idx_game_statistics_user_difficulty: Used for unique lookups by (user_id, difficulty)
-- - idx_daily_challenges_date: Used for getDailyChallenge(date)
-- - idx_leaderboard_difficulty_time: Used for getLeaderboard(difficulty) ORDER BY completion_time
-- - idx_leaderboard_game_session_id: Foreign key index for performance and cascades