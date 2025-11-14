import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { SudokuBoard } from './components/SudokuBoard';
import { NumberPad } from './components/NumberPad';
import { GameControls } from './components/GameControls';
import { MainMenu } from './components/MainMenu';
import { AuthModal } from './components/AuthModal';
import { GameComplete } from './components/GameComplete';
import { PauseOverlay } from './components/PauseOverlay';
import { Statistics } from './components/Statistics';
import { Leaderboard } from './components/Leaderboard';
import { useGameState } from './hooks/useGameState';
import { useDailyChallenge } from './hooks/useDailyChallenge';
import { generateSudokuPuzzle, Difficulty } from './utils/sudoku-generator';
import {
  getCurrentUser,
  signUp,
  signIn,
  signOut,
  onAuthStateChange,
} from './services/auth-service';
import {
  saveGameSession,
  updateGameSession,
  getUserGameSessions,
  updateStatistics,
  addLeaderboardEntry,
} from './services/game-service';
import { Home, Grid3x3 } from 'lucide-react';
import MiniSudokuApp from './MiniSudokuApp';

type Screen = 'menu' | 'game' | 'stats' | 'leaderboard' | 'mini';

function App() {
  const { state, dispatch, getConflictingCells, getCellNotes } = useGameState();
  const { dailyChallenge, todayDate } = useDailyChallenge();
  const [user, setUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [hasSavedGames, setHasSavedGames] = useState(false);

  useEffect(() => {
    loadUser();
    const subscription = onAuthStateChange((user) => {
      setUser(user);
      if (user) {
        checkSavedGames(user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (state.isCompleted && state.id && user) {
      handleGameComplete();
    }
  }, [state.isCompleted]);

  useEffect(() => {
    if (currentScreen === 'game' && state.id && user && !state.isCompleted) {
      const saveInterval = setInterval(() => {
        saveCurrentGame();
      }, 10000);

      return () => clearInterval(saveInterval);
    }
  }, [currentScreen, state, user]);

  const loadUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      checkSavedGames(currentUser.id);
    }
  };

  const checkSavedGames = async (userId: string) => {
    const sessions = await getUserGameSessions(userId, 1);
    setHasSavedGames(sessions.length > 0);
  };

  const handleSignUp = async (email: string, password: string, username: string) => {
    const { user, error } = await signUp(email, password, username);
    if (error) {
      throw new Error(error.message);
    }
    setUser(user);
  };

  const handleSignIn = async (email: string, password: string) => {
    const { user, error } = await signIn(email, password);
    if (error) {
      throw new Error(error.message);
    }
    setUser(user);
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setCurrentScreen('menu');
  };

  const handleNewGame = useCallback((difficulty: Difficulty) => {
    const { puzzle, solution } = generateSudokuPuzzle(difficulty);
    dispatch({
      type: 'NEW_GAME',
      puzzle,
      solution,
      difficulty,
    });
    setCurrentScreen('game');
  }, [dispatch]);

  const handleDailyChallenge = useCallback(() => {
    if (dailyChallenge) {
      dispatch({
        type: 'NEW_GAME',
        puzzle: dailyChallenge.puzzle,
        solution: dailyChallenge.solution,
        difficulty: dailyChallenge.difficulty,
        isDailyChallenge: true,
        dailyChallengeDate: todayDate,
      });
      setCurrentScreen('game');
    }
  }, [dailyChallenge, todayDate, dispatch]);

  const handleContinueGame = useCallback(async () => {
    if (!user) return;
    const sessions = await getUserGameSessions(user.id, 1);
    if (sessions.length > 0) {
      const session = sessions[0];
      dispatch({
        type: 'LOAD_GAME',
        gameState: {
          id: session.id,
          puzzle: session.puzzle,
          solution: session.solution,
          currentState: session.current_state,
          difficulty: session.difficulty,
          timeElapsed: session.time_elapsed,
          mistakesMade: session.mistakes_made,
          hintsUsed: session.hints_used,
          isDailyChallenge: session.is_daily_challenge,
          dailyChallengeDate: session.daily_challenge_date,
        },
      });
      setCurrentScreen('game');
    }
  }, [user, dispatch]);

  const saveCurrentGame = async () => {
    if (!user || state.isCompleted) return;

    const gameData = {
      user_id: user.id,
      puzzle: state.puzzle,
      current_state: state.currentState,
      solution: state.solution,
      difficulty: state.difficulty,
      time_elapsed: state.timeElapsed,
      mistakes_made: state.mistakesMade,
      hints_used: state.hintsUsed,
      is_daily_challenge: state.isDailyChallenge,
      daily_challenge_date: state.dailyChallengeDate,
      is_completed: false,
    };

    if (state.id) {
      await updateGameSession(state.id, gameData);
    } else {
      const session = await saveGameSession(gameData);
      if (session) {
        dispatch({
          type: 'LOAD_GAME',
          gameState: { id: session.id },
        });
      }
    }
  };

  const handleGameComplete = async () => {
    if (!user || !state.id) return;

    await updateGameSession(state.id, {
      is_completed: true,
      completed_at: new Date().toISOString(),
    });

    await updateStatistics(
      user.id,
      state.difficulty,
      state.timeElapsed,
      state.hintsUsed,
      state.mistakesMade
    );

    await addLeaderboardEntry(
      user.id,
      state.id,
      state.difficulty,
      state.timeElapsed,
      state.isDailyChallenge,
      state.dailyChallengeDate
    );

    checkSavedGames(user.id);
  };

  const handleCellClick = (row: number, col: number) => {
    if (state.puzzle[row][col] !== 0) return;
    dispatch({ type: 'SELECT_CELL', row, col });
  };

  const handleNumberClick = (num: number) => {
    if (!state.selectedCell || state.isPaused || state.isCompleted) return;

    const { row, col } = state.selectedCell;

    if (num === 0) {
      dispatch({ type: 'CLEAR_CELL', row, col });
    } else if (state.isNotesMode) {
      dispatch({ type: 'TOGGLE_NOTE', row, col, value: num });
    } else {
      dispatch({ type: 'SET_VALUE', row, col, value: num });
    }
  };

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (state.isPaused || state.isCompleted || currentScreen !== 'game') return;

      if (event.key >= '1' && event.key <= '9') {
        handleNumberClick(parseInt(event.key));
      } else if (event.key === 'Backspace' || event.key === 'Delete' || event.key === '0') {
        handleNumberClick(0);
      } else if (event.key === 'n' || event.key === 'N') {
        dispatch({ type: 'TOGGLE_NOTES_MODE' });
      } else if (event.key === 'h' || event.key === 'H') {
        dispatch({ type: 'USE_HINT' });
      } else if (event.key === 'z' && (event.ctrlKey || event.metaKey)) {
        dispatch({ type: 'UNDO' });
      } else if (event.key === 'y' && (event.ctrlKey || event.metaKey)) {
        dispatch({ type: 'REDO' });
      } else if (event.key === 'Escape') {
        dispatch({ type: 'TOGGLE_PAUSE' });
      } else if (state.selectedCell) {
        const { row, col } = state.selectedCell;
        if (event.key === 'ArrowUp' && row > 0) {
          dispatch({ type: 'SELECT_CELL', row: row - 1, col });
        } else if (event.key === 'ArrowDown' && row < 8) {
          dispatch({ type: 'SELECT_CELL', row: row + 1, col });
        } else if (event.key === 'ArrowLeft' && col > 0) {
          dispatch({ type: 'SELECT_CELL', row, col: col - 1 });
        } else if (event.key === 'ArrowRight' && col < 8) {
          dispatch({ type: 'SELECT_CELL', row, col: col + 1 });
        }
      }
    },
    [state.selectedCell, state.isPaused, state.isCompleted, currentScreen, dispatch]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  if (currentScreen === 'menu') {
    return (
      <>
        <MainMenu
          user={user}
          onNewGame={handleNewGame}
          onContinueGame={handleContinueGame}
          onDailyChallenge={handleDailyChallenge}
          onViewStats={() => setCurrentScreen('stats')}
          onViewLeaderboard={() => setCurrentScreen('leaderboard')}
          onMiniSudoku={() => setCurrentScreen('mini')}
          onSignIn={() => setShowAuthModal(true)}
          onSignOut={handleSignOut}
          onProfile={() => setCurrentScreen('stats')}
          hasSavedGames={hasSavedGames}
        />
        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            onSignUp={handleSignUp}
            onSignIn={handleSignIn}
          />
        )}
      </>
    );
  }

  if (currentScreen === 'mini') {
    return <MiniSudokuApp onBack={() => setCurrentScreen('menu')} />;
  }

  if (currentScreen === 'stats' && user) {
    return <Statistics userId={user.id} onBack={() => setCurrentScreen('menu')} />;
  }

  if (currentScreen === 'leaderboard') {
    return <Leaderboard onBack={() => setCurrentScreen('menu')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              if (user && !state.isCompleted) {
                saveCurrentGame();
              }
              setCurrentScreen('menu');
            }}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Menu</span>
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800 capitalize">
              {state.difficulty} {state.isDailyChallenge ? '- Daily Challenge' : ''}
            </h1>
          </div>
          <div className="w-20"></div>
        </div>

        <div className="flex flex-col lg:flex-row items-start justify-center gap-8">
          <div className="flex flex-col items-center gap-6">
            <SudokuBoard
              puzzle={state.puzzle}
              currentState={state.currentState}
              selectedCell={state.selectedCell}
              getConflictingCells={getConflictingCells}
              getCellNotes={getCellNotes}
              onCellClick={handleCellClick}
            />
            <NumberPad
              onNumberClick={handleNumberClick}
              disabled={state.isPaused || state.isCompleted || !state.selectedCell}
            />
          </div>

          <GameControls
            timeElapsed={state.timeElapsed}
            mistakesMade={state.mistakesMade}
            hintsUsed={state.hintsUsed}
            isPaused={state.isPaused}
            isNotesMode={state.isNotesMode}
            canUndo={state.historyIndex >= 0}
            canRedo={state.historyIndex < state.history.length - 1}
            isCompleted={state.isCompleted}
            onHint={() => dispatch({ type: 'USE_HINT' })}
            onUndo={() => dispatch({ type: 'UNDO' })}
            onRedo={() => dispatch({ type: 'REDO' })}
            onToggleNotes={() => dispatch({ type: 'TOGGLE_NOTES_MODE' })}
            onTogglePause={() => dispatch({ type: 'TOGGLE_PAUSE' })}
          />
        </div>
      </div>

      {state.isPaused && !state.isCompleted && (
        <PauseOverlay
          onResume={() => dispatch({ type: 'TOGGLE_PAUSE' })}
          onMainMenu={() => {
            if (user && !state.isCompleted) {
              saveCurrentGame();
            }
            setCurrentScreen('menu');
          }}
        />
      )}

      {state.isCompleted && (
        <GameComplete
          timeElapsed={state.timeElapsed}
          mistakesMade={state.mistakesMade}
          hintsUsed={state.hintsUsed}
          difficulty={state.difficulty}
          onNewGame={() => handleNewGame(state.difficulty)}
          onMainMenu={() => setCurrentScreen('menu')}
        />
      )}
    </div>
  );
}

export default App;
