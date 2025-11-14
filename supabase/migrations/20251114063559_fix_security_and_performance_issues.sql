/*
  # Fix Security and Performance Issues

  ## Overview
  This migration addresses critical security and performance issues identified in the database:
  1. Missing foreign key index on leaderboard_entries
  2. RLS policies using auth.uid() without SELECT wrapper (causes re-evaluation per row)
  3. Multiple permissive policies that can be consolidated
  4. Function search path security issue

  ## Changes Made

  ### 1. Add Missing Index
  - Add index on `leaderboard_entries.game_session_id` for foreign key performance

  ### 2. Fix RLS Policies
  Replace all `auth.uid()` calls with `(select auth.uid())` to prevent per-row re-evaluation:
  - profiles table: 3 policies updated
  - game_sessions table: 4 policies updated
  - game_statistics table: 3 policies updated
  - leaderboard_entries table: 1 policy updated

  ### 3. Consolidate Multiple Permissive Policies
  Merge multiple SELECT policies into single policies:
  - profiles: Combine "view own" and "view others" into one policy
  - game_sessions: Combine "view own" and "view guest" into one policy

  ### 4. Fix Function Security
  Update update_updated_at_column function with immutable search_path

  ## Security Impact
  - Improved query performance at scale by preventing per-row function evaluation
  - Better index coverage for foreign key relationships
  - Secure function execution with immutable search_path
  - Simplified policy structure while maintaining same access controls
*/

-- Add missing index on foreign key
CREATE INDEX IF NOT EXISTS idx_leaderboard_game_session_id 
  ON leaderboard_entries(game_session_id);

-- Fix function search path security issue
-- Drop function with CASCADE to handle trigger dependencies
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers for the function
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_sessions_updated_at
  BEFORE UPDATE ON game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_statistics_updated_at
  BEFORE UPDATE ON game_statistics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Fix profiles table RLS policies
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view other profiles for leaderboard" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create consolidated and optimized policies
CREATE POLICY "Users can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- Fix game_sessions table RLS policies
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own game sessions" ON game_sessions;
DROP POLICY IF EXISTS "Authenticated users can view guest games" ON game_sessions;
DROP POLICY IF EXISTS "Users can create their own game sessions" ON game_sessions;
DROP POLICY IF EXISTS "Users can update their own game sessions" ON game_sessions;
DROP POLICY IF EXISTS "Users can delete their own game sessions" ON game_sessions;

-- Create consolidated and optimized policies
CREATE POLICY "Users can view accessible game sessions"
  ON game_sessions FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id OR user_id IS NULL);

CREATE POLICY "Users can create own game sessions"
  ON game_sessions FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own game sessions"
  ON game_sessions FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own game sessions"
  ON game_sessions FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Fix game_statistics table RLS policies
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own statistics" ON game_statistics;
DROP POLICY IF EXISTS "Users can insert their own statistics" ON game_statistics;
DROP POLICY IF EXISTS "Users can update their own statistics" ON game_statistics;

-- Create optimized policies
CREATE POLICY "Users can view own statistics"
  ON game_statistics FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own statistics"
  ON game_statistics FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own statistics"
  ON game_statistics FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Fix leaderboard_entries table RLS policies
-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own leaderboard entries" ON leaderboard_entries;

-- Create optimized policy
CREATE POLICY "Users can insert own leaderboard entries"
  ON leaderboard_entries FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Note: Unused indexes are intentionally kept as they will be used as the application scales
-- and query patterns develop. They provide performance benefits for common query patterns:
-- - idx_game_sessions_user_id: Used for fetching user's games
-- - idx_game_sessions_is_completed: Used for filtering active/completed games
-- - idx_game_sessions_difficulty: Used for difficulty-based queries
-- - idx_game_sessions_daily_challenge: Used for daily challenge queries
-- - idx_game_statistics_user_difficulty: Used for statistics lookups
-- - idx_daily_challenges_date: Used for fetching daily challenges by date
-- - idx_leaderboard_difficulty_time: Used for leaderboard rankings
-- - idx_leaderboard_daily_challenge: Used for daily challenge leaderboards
-- - idx_leaderboard_user_id: Used for user's leaderboard entries