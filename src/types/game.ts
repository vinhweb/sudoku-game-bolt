import { SudokuGrid, Difficulty } from '../utils/sudoku-generator';

export interface GameState {
  id: string | null;
  puzzle: SudokuGrid;
  solution: SudokuGrid;
  currentState: SudokuGrid;
  notes: Map<string, Set<number>>;
  difficulty: Difficulty;
  timeElapsed: number;
  mistakesMade: number;
  hintsUsed: number;
  isCompleted: boolean;
  isPaused: boolean;
  isNotesMode: boolean;
  selectedCell: { row: number; col: number } | null;
  history: GameHistoryEntry[];
  historyIndex: number;
  isDailyChallenge: boolean;
  dailyChallengeDate: string | null;
}

export interface GameHistoryEntry {
  action: 'setValue' | 'setNote' | 'clearCell' | 'clearNote';
  row: number;
  col: number;
  value?: number;
  previousValue?: number;
  previousNotes?: Set<number>;
}

export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface GameSession {
  id: string;
  user_id: string | null;
  difficulty: Difficulty;
  puzzle: SudokuGrid;
  current_state: SudokuGrid;
  solution: SudokuGrid;
  is_completed: boolean;
  time_elapsed: number;
  mistakes_made: number;
  hints_used: number;
  is_daily_challenge: boolean;
  daily_challenge_date: string | null;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GameStatistics {
  id: string;
  user_id: string;
  difficulty: Difficulty;
  games_played: number;
  games_completed: number;
  total_time: number;
  best_time: number | null;
  average_time: number;
  total_hints_used: number;
  total_mistakes: number;
  current_streak: number;
  longest_streak: number;
  last_played_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailyChallenge {
  id: string;
  challenge_date: string;
  difficulty: Difficulty;
  puzzle: SudokuGrid;
  solution: SudokuGrid;
  created_at: string;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  game_session_id: string;
  difficulty: Difficulty;
  completion_time: number;
  is_daily_challenge: boolean;
  daily_challenge_date: string | null;
  completed_at: string;
  created_at: string;
  profile?: Profile;
}

export type GameAction =
  | { type: 'SET_VALUE'; row: number; col: number; value: number }
  | { type: 'CLEAR_CELL'; row: number; col: number }
  | { type: 'TOGGLE_NOTE'; row: number; col: number; value: number }
  | { type: 'CLEAR_NOTES'; row: number; col: number }
  | { type: 'SELECT_CELL'; row: number; col: number }
  | { type: 'DESELECT_CELL' }
  | { type: 'TOGGLE_NOTES_MODE' }
  | { type: 'USE_HINT' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'UPDATE_TIME'; timeElapsed: number }
  | { type: 'COMPLETE_GAME' }
  | { type: 'NEW_GAME'; puzzle: SudokuGrid; solution: SudokuGrid; difficulty: Difficulty; isDailyChallenge?: boolean; dailyChallengeDate?: string | null }
  | { type: 'LOAD_GAME'; gameState: Partial<GameState> };
