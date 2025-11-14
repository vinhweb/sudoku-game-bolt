/*
  # Sudoku Game Database Schema

  ## Overview
  Complete database schema for a production-ready Sudoku game web application with user authentication, 
  game persistence, statistics tracking, daily challenges, and leaderboards.

  ## New Tables

  ### 1. `profiles`
  User profile information extending Supabase auth.users
  - `id` (uuid, primary key, references auth.users)
  - `username` (text, unique)
  - `avatar_url` (text, optional)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `game_sessions`
  Stores ongoing and completed Sudoku games
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles, nullable for guest games)
  - `difficulty` (text: easy, medium, hard, expert)
  - `puzzle` (jsonb: original puzzle grid)
  - `current_state` (jsonb: current game state with user entries)
  - `solution` (jsonb: complete solution)
  - `is_completed` (boolean)
  - `time_elapsed` (integer: seconds)
  - `mistakes_made` (integer)
  - `hints_used` (integer)
  - `is_daily_challenge` (boolean)
  - `daily_challenge_date` (date, nullable)
  - `started_at` (timestamptz)
  - `completed_at` (timestamptz, nullable)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `game_statistics`
  Aggregate statistics per user and difficulty level
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `difficulty` (text)
  - `games_played` (integer)
  - `games_completed` (integer)
  - `total_time` (integer: total seconds)
  - `best_time` (integer: best time in seconds)
  - `average_time` (integer: average time in seconds)
  - `total_hints_used` (integer)
  - `total_mistakes` (integer)
  - `current_streak` (integer: consecutive days played)
  - `longest_streak` (integer)
  - `last_played_at` (timestamptz)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - Unique constraint on (user_id, difficulty)

  ### 4. `daily_challenges`
  Daily puzzle shared by all players
  - `id` (uuid, primary key)
  - `challenge_date` (date, unique)
  - `difficulty` (text)
  - `puzzle` (jsonb)
  - `solution` (jsonb)
  - `created_at` (timestamptz)

  ### 5. `leaderboard_entries`
  Fast completion times for competitive rankings
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `game_session_id` (uuid, references game_sessions)
  - `difficulty` (text)
  - `completion_time` (integer: seconds)
  - `is_daily_challenge` (boolean)
  - `daily_challenge_date` (date, nullable)
  - `completed_at` (timestamptz)
  - `created_at` (timestamptz)

  ## Security

  All tables have Row Level Security (RLS) enabled with appropriate policies:
  - Users can read their own data
  - Users can create/update their own game sessions and statistics
  - Public read access to leaderboards (with user profile info)
  - Daily challenges are publicly readable
  - Restrictive policies based on auth.uid() and ownership checks

  ## Indexes

  Performance indexes on frequently queried columns:
  - game_sessions: user_id, is_completed, difficulty, daily_challenge_date
  - leaderboard_entries: difficulty, completion_time, daily_challenge_date
  - game_statistics: user_id, difficulty
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can view other profiles for leaderboard"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create game_sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  puzzle jsonb NOT NULL,
  current_state jsonb NOT NULL,
  solution jsonb NOT NULL,
  is_completed boolean DEFAULT false,
  time_elapsed integer DEFAULT 0,
  mistakes_made integer DEFAULT 0,
  hints_used integer DEFAULT 0,
  is_daily_challenge boolean DEFAULT false,
  daily_challenge_date date,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own game sessions"
  ON game_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view guest games"
  ON game_sessions FOR SELECT
  TO authenticated
  USING (user_id IS NULL);

CREATE POLICY "Users can create their own game sessions"
  ON game_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own game sessions"
  ON game_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own game sessions"
  ON game_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for game_sessions
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_is_completed ON game_sessions(is_completed);
CREATE INDEX IF NOT EXISTS idx_game_sessions_difficulty ON game_sessions(difficulty);
CREATE INDEX IF NOT EXISTS idx_game_sessions_daily_challenge ON game_sessions(daily_challenge_date) WHERE is_daily_challenge = true;

-- Create game_statistics table
CREATE TABLE IF NOT EXISTS game_statistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  games_played integer DEFAULT 0,
  games_completed integer DEFAULT 0,
  total_time integer DEFAULT 0,
  best_time integer,
  average_time integer DEFAULT 0,
  total_hints_used integer DEFAULT 0,
  total_mistakes integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_played_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, difficulty)
);

ALTER TABLE game_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own statistics"
  ON game_statistics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own statistics"
  ON game_statistics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own statistics"
  ON game_statistics FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for game_statistics
CREATE INDEX IF NOT EXISTS idx_game_statistics_user_difficulty ON game_statistics(user_id, difficulty);

-- Create daily_challenges table
CREATE TABLE IF NOT EXISTS daily_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date date UNIQUE NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  puzzle jsonb NOT NULL,
  solution jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view daily challenges"
  ON daily_challenges FOR SELECT
  TO authenticated
  USING (true);

-- Create index for daily_challenges
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON daily_challenges(challenge_date);

-- Create leaderboard_entries table
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  game_session_id uuid REFERENCES game_sessions(id) ON DELETE CASCADE NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  completion_time integer NOT NULL,
  is_daily_challenge boolean DEFAULT false,
  daily_challenge_date date,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leaderboard entries"
  ON leaderboard_entries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own leaderboard entries"
  ON leaderboard_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for leaderboard_entries
CREATE INDEX IF NOT EXISTS idx_leaderboard_difficulty_time ON leaderboard_entries(difficulty, completion_time);
CREATE INDEX IF NOT EXISTS idx_leaderboard_daily_challenge ON leaderboard_entries(daily_challenge_date, completion_time) WHERE is_daily_challenge = true;
CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id ON leaderboard_entries(user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_game_sessions_updated_at') THEN
    CREATE TRIGGER update_game_sessions_updated_at
      BEFORE UPDATE ON game_sessions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_game_statistics_updated_at') THEN
    CREATE TRIGGER update_game_statistics_updated_at
      BEFORE UPDATE ON game_statistics
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;