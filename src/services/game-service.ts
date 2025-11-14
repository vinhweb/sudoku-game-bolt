import { supabase } from '../lib/supabase';
import { GameSession, GameStatistics, DailyChallenge, LeaderboardEntry } from '../types/game';
import { SudokuGrid, Difficulty } from '../utils/sudoku-generator';

export async function saveGameSession(session: Partial<GameSession>): Promise<GameSession | null> {
  const { data, error } = await supabase
    .from('game_sessions')
    .insert([session])
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error saving game session:', error);
    return null;
  }

  return data;
}

export async function updateGameSession(id: string, updates: Partial<GameSession>): Promise<GameSession | null> {
  const { data, error } = await supabase
    .from('game_sessions')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating game session:', error);
    return null;
  }

  return data;
}

export async function getGameSession(id: string): Promise<GameSession | null> {
  const { data, error } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching game session:', error);
    return null;
  }

  return data;
}

export async function getUserGameSessions(userId: string, limit: number = 10): Promise<GameSession[]> {
  const { data, error } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_completed', false)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching user game sessions:', error);
    return [];
  }

  return data || [];
}

export async function deleteGameSession(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('game_sessions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting game session:', error);
    return false;
  }

  return true;
}

export async function getOrCreateStatistics(
  userId: string,
  difficulty: Difficulty,
  gameType: 'standard' | 'mini' = 'standard'
): Promise<GameStatistics | null> {
  const { data: existing, error: fetchError } = await supabase
    .from('game_statistics')
    .select('*')
    .eq('user_id', userId)
    .eq('difficulty', difficulty)
    .eq('game_type', gameType)
    .maybeSingle();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error fetching statistics:', fetchError);
    return null;
  }

  if (existing) {
    return existing;
  }

  const { data: newStats, error: insertError } = await supabase
    .from('game_statistics')
    .insert([
      {
        user_id: userId,
        difficulty,
        game_type: gameType,
        games_played: 0,
        games_completed: 0,
        total_time: 0,
        best_time: null,
        average_time: 0,
        total_hints_used: 0,
        total_mistakes: 0,
        current_streak: 0,
        longest_streak: 0,
      },
    ])
    .select()
    .maybeSingle();

  if (insertError) {
    console.error('Error creating statistics:', insertError);
    return null;
  }

  return newStats;
}

export async function updateStatistics(
  userId: string,
  difficulty: Difficulty,
  completionTime: number,
  hintsUsed: number,
  mistakes: number,
  gameType: 'standard' | 'mini' = 'standard'
): Promise<void> {
  const stats = await getOrCreateStatistics(userId, difficulty, gameType);

  if (!stats) return;

  const newGamesCompleted = stats.games_completed + 1;
  const newTotalTime = stats.total_time + completionTime;
  const newAverageTime = Math.floor(newTotalTime / newGamesCompleted);
  const newBestTime = stats.best_time ? Math.min(stats.best_time, completionTime) : completionTime;

  const { error } = await supabase
    .from('game_statistics')
    .update({
      games_played: stats.games_played + 1,
      games_completed: newGamesCompleted,
      total_time: newTotalTime,
      best_time: newBestTime,
      average_time: newAverageTime,
      total_hints_used: stats.total_hints_used + hintsUsed,
      total_mistakes: stats.total_mistakes + mistakes,
      last_played_at: new Date().toISOString(),
    })
    .eq('id', stats.id);

  if (error) {
    console.error('Error updating statistics:', error);
  }
}

export async function getUserStatistics(userId: string): Promise<GameStatistics[]> {
  const { data, error } = await supabase
    .from('game_statistics')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user statistics:', error);
    return [];
  }

  return data || [];
}

export async function getDailyChallenge(date: string): Promise<DailyChallenge | null> {
  const { data, error } = await supabase
    .from('daily_challenges')
    .select('*')
    .eq('challenge_date', date)
    .maybeSingle();

  if (error) {
    console.error('Error fetching daily challenge:', error);
    return null;
  }

  return data;
}

export async function createDailyChallenge(
  date: string,
  difficulty: Difficulty,
  puzzle: SudokuGrid,
  solution: SudokuGrid
): Promise<DailyChallenge | null> {
  const { data, error } = await supabase
    .from('daily_challenges')
    .insert([
      {
        challenge_date: date,
        difficulty,
        puzzle,
        solution,
      },
    ])
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating daily challenge:', error);
    return null;
  }

  return data;
}

export async function addLeaderboardEntry(
  userId: string,
  gameSessionId: string,
  difficulty: Difficulty,
  completionTime: number,
  isDailyChallenge: boolean,
  dailyChallengeDate: string | null,
  gameType: 'standard' | 'mini' = 'standard'
): Promise<LeaderboardEntry | null> {
  const { data, error } = await supabase
    .from('leaderboard_entries')
    .insert([
      {
        user_id: userId,
        game_session_id: gameSessionId,
        difficulty,
        completion_time: completionTime,
        is_daily_challenge: isDailyChallenge,
        daily_challenge_date: dailyChallengeDate,
        game_type: gameType,
      },
    ])
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error adding leaderboard entry:', error);
    return null;
  }

  return data;
}

export async function getLeaderboard(
  difficulty: Difficulty,
  gameType: 'standard' | 'mini' = 'standard',
  limit: number = 100
): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard_entries')
    .select(`
      *,
      profile:profiles(username, avatar_url)
    `)
    .eq('difficulty', difficulty)
    .eq('game_type', gameType)
    .eq('is_daily_challenge', false)
    .order('completion_time', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }

  return data || [];
}

export async function getDailyChallengeLeaderboard(
  date: string,
  limit: number = 100
): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard_entries')
    .select(`
      *,
      profile:profiles(username, avatar_url)
    `)
    .eq('is_daily_challenge', true)
    .eq('daily_challenge_date', date)
    .order('completion_time', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching daily challenge leaderboard:', error);
    return [];
  }

  return data || [];
}
