import React, { useCallback, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { MiniSudokuBoard } from './components/MiniSudokuBoard';
import { MiniNumberPad } from './components/MiniNumberPad';
import { GameComplete } from './components/GameComplete';
import { PauseOverlay } from './components/PauseOverlay';
import { useMiniGameState } from './hooks/useMiniGameState';
import { generateMiniSudokuPuzzle, MiniDifficulty } from './utils/mini-sudoku-generator';
import { Home, Lightbulb, Undo2, Redo2, Pause, Play, Timer, RotateCcw, LogIn } from 'lucide-react';
import { getCurrentUser, onAuthStateChange } from './services/auth-service';
import { saveGameSession, updateGameSession, updateStatistics, addLeaderboardEntry } from './services/game-service';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

interface MiniSudokuAppProps {
  onBack?: () => void;
}

function MiniSudokuApp({ onBack }: MiniSudokuAppProps) {
  const { state, dispatch, getConflictingCells } = useMiniGameState();
  const [showMenu, setShowMenu] = React.useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<MiniDifficulty>('medium');
  const [user, setUser] = useState<User | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
    const subscription = onAuthStateChange((user) => {
      setUser(user);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const loadUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  };

  const handleNewGame = useCallback(async (difficulty: MiniDifficulty) => {
    const { puzzle, solution } = generateMiniSudokuPuzzle(difficulty);
    dispatch({
      type: 'NEW_GAME',
      puzzle,
      solution,
      difficulty,
    });
    setShowMenu(false);

    if (user) {
      const session = await saveGameSession({
        user_id: user.id,
        difficulty,
        puzzle,
        solution,
        current_state: puzzle,
        is_completed: false,
        time_elapsed: 0,
        mistakes_made: 0,
        hints_used: 0,
        is_daily_challenge: false,
        started_at: new Date().toISOString(),
        game_type: 'mini',
      });

      if (session) {
        setCurrentSessionId(session.id);
      }
    }
  }, [dispatch, user]);

  const handleCellClick = (row: number, col: number) => {
    if (state.puzzle[row][col] !== 0) return;
    dispatch({ type: 'SELECT_CELL', row, col });
  };

  const handleNumberClick = (num: number) => {
    if (!state.selectedCell || state.isPaused || state.isCompleted) return;

    const { row, col } = state.selectedCell;

    if (num === 0) {
      dispatch({ type: 'CLEAR_CELL', row, col });
    } else {
      dispatch({ type: 'SET_VALUE', row, col, value: num });
    }
  };

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (state.isPaused || state.isCompleted || showMenu) return;

      if (event.key >= '1' && event.key <= '3') {
        handleNumberClick(parseInt(event.key));
      } else if (event.key === 'Backspace' || event.key === 'Delete' || event.key === '0') {
        handleNumberClick(0);
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
        } else if (event.key === 'ArrowDown' && row < 2) {
          dispatch({ type: 'SELECT_CELL', row: row + 1, col });
        } else if (event.key === 'ArrowLeft' && col > 0) {
          dispatch({ type: 'SELECT_CELL', row, col: col - 1 });
        } else if (event.key === 'ArrowRight' && col < 2) {
          dispatch({ type: 'SELECT_CELL', row, col: col + 1 });
        }
      }
    },
    [state.selectedCell, state.isPaused, state.isCompleted, showMenu, dispatch]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (state.isCompleted && user && currentSessionId) {
      handleGameComplete();
    }
  }, [state.isCompleted]);

  const handleGameComplete = async () => {
    if (!user || !currentSessionId) return;

    await updateGameSession(currentSessionId, {
      current_state: state.currentState,
      is_completed: true,
      time_elapsed: state.timeElapsed,
      mistakes_made: state.mistakesMade,
      hints_used: state.hintsUsed,
      completed_at: new Date().toISOString(),
    });

    await updateStatistics(
      user.id,
      state.difficulty,
      state.timeElapsed,
      state.hintsUsed,
      state.mistakesMade,
      'mini'
    );

    await addLeaderboardEntry(
      user.id,
      currentSessionId,
      state.difficulty,
      state.timeElapsed,
      false,
      null,
      'mini'
    );
  };

  const handleBackToMain = () => {
    if (onBack) {
      onBack();
    } else {
      setShowMenu(true);
    }
  };

  if (showMenu) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-6xl font-bold text-slate-800">Mini Sudoku</h1>
            <p className="text-slate-600">3x3 Puzzle Challenge</p>
            <p className="text-sm text-slate-500">Fill each row and column with 1, 2, and 3</p>
          </div>

          {!user && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <p className="text-amber-800 text-sm">
                <LogIn className="w-4 h-4 inline mr-1" />
                Sign in to save your scores and compete on the leaderboard
              </p>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-xl p-6 space-y-3">
            <h3 className="text-xl font-semibold text-slate-800 text-center mb-4">Select Difficulty</h3>

            <button
              onClick={() => {
                setSelectedDifficulty('easy');
                handleNewGame('easy');
              }}
              className="w-full p-4 rounded-xl bg-green-100 text-green-700 hover:bg-green-200 transition-all duration-200 font-semibold text-lg"
            >
              Easy (2 empty cells)
            </button>

            <button
              onClick={() => {
                setSelectedDifficulty('medium');
                handleNewGame('medium');
              }}
              className="w-full p-4 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all duration-200 font-semibold text-lg"
            >
              Medium (4 empty cells)
            </button>

            <button
              onClick={() => {
                setSelectedDifficulty('hard');
                handleNewGame('hard');
              }}
              className="w-full p-4 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition-all duration-200 font-semibold text-lg"
            >
              Hard (5 empty cells)
            </button>
          </div>

          {onBack && (
            <button
              onClick={handleBackToMain}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all duration-200"
            >
              <Home className="w-5 h-5" />
              <span>Back to Main Menu</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBackToMain}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Menu</span>
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800 capitalize">
              Mini Sudoku - {state.difficulty}
            </h1>
            {user && (
              <p className="text-sm text-slate-500">Scores will be saved</p>
            )}
          </div>
          <button
            onClick={() => handleNewGame(selectedDifficulty)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            <span className="font-medium">New</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row items-start justify-center gap-8">
          <div className="flex flex-col items-center gap-6">
            <MiniSudokuBoard
              puzzle={state.puzzle}
              currentState={state.currentState}
              selectedCell={state.selectedCell}
              getConflictingCells={getConflictingCells}
              onCellClick={handleCellClick}
            />
            <MiniNumberPad
              onNumberClick={handleNumberClick}
              disabled={state.isPaused || state.isCompleted || !state.selectedCell}
            />
          </div>

          <div className="w-full max-w-md space-y-4">
            <div className="flex items-center justify-between bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold text-slate-800">{formatTime(state.timeElapsed)}</span>
              </div>
              <button
                onClick={() => dispatch({ type: 'TOGGLE_PAUSE' })}
                disabled={state.isCompleted}
                className={`
                  p-2 rounded-lg transition-all duration-200
                  ${
                    state.isCompleted
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-green-100 text-green-600 hover:bg-green-200 active:scale-95'
                  }
                `}
              >
                {state.isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 bg-white rounded-lg shadow-md p-3 text-center">
                <div className="text-sm text-slate-600">Mistakes</div>
                <div className="text-xl font-bold text-red-600">{state.mistakesMade}</div>
              </div>
              <div className="flex-1 bg-white rounded-lg shadow-md p-3 text-center">
                <div className="text-sm text-slate-600">Hints</div>
                <div className="text-xl font-bold text-amber-600">{state.hintsUsed}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => dispatch({ type: 'UNDO' })}
                disabled={state.historyIndex < 0 || state.isPaused || state.isCompleted}
                className={`
                  flex flex-col items-center justify-center gap-1 p-3 rounded-lg
                  transition-all duration-200
                  ${
                    state.historyIndex < 0 || state.isPaused || state.isCompleted
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-white text-slate-700 hover:bg-slate-50 active:scale-95 shadow-md'
                  }
                `}
              >
                <Undo2 className="w-5 h-5" />
                <span className="text-xs">Undo</span>
              </button>

              <button
                onClick={() => dispatch({ type: 'REDO' })}
                disabled={state.historyIndex >= state.history.length - 1 || state.isPaused || state.isCompleted}
                className={`
                  flex flex-col items-center justify-center gap-1 p-3 rounded-lg
                  transition-all duration-200
                  ${
                    state.historyIndex >= state.history.length - 1 || state.isPaused || state.isCompleted
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-white text-slate-700 hover:bg-slate-50 active:scale-95 shadow-md'
                  }
                `}
              >
                <Redo2 className="w-5 h-5" />
                <span className="text-xs">Redo</span>
              </button>

              <button
                onClick={() => dispatch({ type: 'USE_HINT' })}
                disabled={state.isPaused || state.isCompleted}
                className={`
                  flex flex-col items-center justify-center gap-1 p-3 rounded-lg
                  transition-all duration-200
                  ${
                    state.isPaused || state.isCompleted
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-amber-500 text-white hover:bg-amber-600 active:scale-95 shadow-md'
                  }
                `}
              >
                <Lightbulb className="w-5 h-5" />
                <span className="text-xs">Hint</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {state.isPaused && !state.isCompleted && (
        <PauseOverlay
          onResume={() => dispatch({ type: 'TOGGLE_PAUSE' })}
          onMainMenu={handleBackToMain}
        />
      )}

      {state.isCompleted && (
        <GameComplete
          timeElapsed={state.timeElapsed}
          mistakesMade={state.mistakesMade}
          hintsUsed={state.hintsUsed}
          difficulty={state.difficulty}
          onNewGame={() => handleNewGame(selectedDifficulty)}
          onMainMenu={handleBackToMain}
        />
      )}
    </div>
  );
}

export default MiniSudokuApp;
