import { useReducer, useEffect, useCallback, useRef } from 'react';
import {
  deepCopyMiniGrid,
  isMiniGridComplete,
  getMiniConflicts,
  getMiniHint,
  MiniSudokuGrid,
  MiniDifficulty
} from '../utils/mini-sudoku-generator';

const GRID_SIZE = 3;

interface MiniGameState {
  puzzle: MiniSudokuGrid;
  solution: MiniSudokuGrid;
  currentState: MiniSudokuGrid;
  difficulty: MiniDifficulty;
  timeElapsed: number;
  mistakesMade: number;
  hintsUsed: number;
  isCompleted: boolean;
  isPaused: boolean;
  selectedCell: { row: number; col: number } | null;
  history: MiniGameHistoryEntry[];
  historyIndex: number;
}

interface MiniGameHistoryEntry {
  action: 'setValue' | 'clearCell';
  row: number;
  col: number;
  value?: number;
  previousValue?: number;
}

type MiniGameAction =
  | { type: 'SET_VALUE'; row: number; col: number; value: number }
  | { type: 'CLEAR_CELL'; row: number; col: number }
  | { type: 'SELECT_CELL'; row: number; col: number }
  | { type: 'DESELECT_CELL' }
  | { type: 'USE_HINT' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'UPDATE_TIME'; timeElapsed: number }
  | { type: 'COMPLETE_GAME' }
  | { type: 'NEW_GAME'; puzzle: MiniSudokuGrid; solution: MiniSudokuGrid; difficulty: MiniDifficulty };

function createInitialState(): MiniGameState {
  const emptyGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
  return {
    puzzle: emptyGrid,
    solution: emptyGrid,
    currentState: emptyGrid,
    difficulty: 'medium',
    timeElapsed: 0,
    mistakesMade: 0,
    hintsUsed: 0,
    isCompleted: false,
    isPaused: false,
    selectedCell: null,
    history: [],
    historyIndex: -1,
  };
}

function miniGameReducer(state: MiniGameState, action: MiniGameAction): MiniGameState {
  switch (action.type) {
    case 'NEW_GAME': {
      return {
        ...createInitialState(),
        puzzle: action.puzzle,
        solution: action.solution,
        currentState: deepCopyMiniGrid(action.puzzle),
        difficulty: action.difficulty,
      };
    }

    case 'SET_VALUE': {
      const { row, col, value } = action;

      if (state.puzzle[row][col] !== 0 || state.isCompleted || state.isPaused) {
        return state;
      }

      const newState = deepCopyMiniGrid(state.currentState);
      const previousValue = newState[row][col];
      newState[row][col] = value;

      const historyEntry: MiniGameHistoryEntry = {
        action: 'setValue',
        row,
        col,
        value,
        previousValue,
      };

      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(historyEntry);

      const isCorrect = value === state.solution[row][col];
      const mistakesMade = isCorrect ? state.mistakesMade : state.mistakesMade + 1;

      const isComplete = isMiniGridComplete(newState);

      return {
        ...state,
        currentState: newState,
        mistakesMade,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        isCompleted: isComplete,
      };
    }

    case 'CLEAR_CELL': {
      const { row, col } = action;

      if (state.puzzle[row][col] !== 0 || state.isCompleted || state.isPaused) {
        return state;
      }

      const newState = deepCopyMiniGrid(state.currentState);
      const previousValue = newState[row][col];

      if (previousValue === 0) {
        return state;
      }

      newState[row][col] = 0;

      const historyEntry: MiniGameHistoryEntry = {
        action: 'clearCell',
        row,
        col,
        previousValue,
      };

      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(historyEntry);

      return {
        ...state,
        currentState: newState,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case 'SELECT_CELL': {
      return {
        ...state,
        selectedCell: { row: action.row, col: action.col },
      };
    }

    case 'DESELECT_CELL': {
      return {
        ...state,
        selectedCell: null,
      };
    }

    case 'USE_HINT': {
      if (state.isCompleted || state.isPaused) {
        return state;
      }

      const hint = getMiniHint(state.puzzle, state.currentState, state.solution);

      if (!hint) {
        return state;
      }

      const newState = deepCopyMiniGrid(state.currentState);
      newState[hint.row][hint.col] = hint.value;

      const historyEntry: MiniGameHistoryEntry = {
        action: 'setValue',
        row: hint.row,
        col: hint.col,
        value: hint.value,
        previousValue: 0,
      };

      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(historyEntry);

      const isComplete = isMiniGridComplete(newState);

      return {
        ...state,
        currentState: newState,
        hintsUsed: state.hintsUsed + 1,
        selectedCell: { row: hint.row, col: hint.col },
        history: newHistory,
        historyIndex: newHistory.length - 1,
        isCompleted: isComplete,
      };
    }

    case 'UNDO': {
      if (state.historyIndex < 0 || state.isCompleted || state.isPaused) {
        return state;
      }

      const entry = state.history[state.historyIndex];
      const newState = deepCopyMiniGrid(state.currentState);

      if (entry.action === 'setValue') {
        newState[entry.row][entry.col] = entry.previousValue || 0;
      } else if (entry.action === 'clearCell') {
        newState[entry.row][entry.col] = entry.previousValue || 0;
      }

      return {
        ...state,
        currentState: newState,
        historyIndex: state.historyIndex - 1,
      };
    }

    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1 || state.isCompleted || state.isPaused) {
        return state;
      }

      const entry = state.history[state.historyIndex + 1];
      const newState = deepCopyMiniGrid(state.currentState);

      if (entry.action === 'setValue') {
        newState[entry.row][entry.col] = entry.value || 0;
      } else if (entry.action === 'clearCell') {
        newState[entry.row][entry.col] = 0;
      }

      return {
        ...state,
        currentState: newState,
        historyIndex: state.historyIndex + 1,
      };
    }

    case 'TOGGLE_PAUSE': {
      return {
        ...state,
        isPaused: !state.isPaused,
      };
    }

    case 'UPDATE_TIME': {
      return {
        ...state,
        timeElapsed: action.timeElapsed,
      };
    }

    case 'COMPLETE_GAME': {
      return {
        ...state,
        isCompleted: true,
        isPaused: true,
      };
    }

    default:
      return state;
  }
}

export function useMiniGameState() {
  const [state, dispatch] = useReducer(miniGameReducer, createInitialState());
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!state.isPaused && !state.isCompleted) {
      timerRef.current = window.setInterval(() => {
        dispatch({ type: 'UPDATE_TIME', timeElapsed: state.timeElapsed + 1 });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state.isPaused, state.isCompleted, state.timeElapsed]);

  const getConflictingCells = useCallback((row: number, col: number): Set<string> => {
    return getMiniConflicts(state.currentState, row, col);
  }, [state.currentState]);

  return {
    state,
    dispatch,
    getConflictingCells,
  };
}
