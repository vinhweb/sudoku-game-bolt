import { useReducer, useEffect, useCallback, useRef } from 'react';
import { GameState, GameAction, GameHistoryEntry } from '../types/game';
import {
  deepCopyGrid,
  isGridComplete,
  getConflicts,
  getHint,
  SudokuGrid,
  Difficulty
} from '../utils/sudoku-generator';

const GRID_SIZE = 9;

function createInitialState(): GameState {
  const emptyGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
  return {
    id: null,
    puzzle: emptyGrid,
    solution: emptyGrid,
    currentState: emptyGrid,
    notes: new Map(),
    difficulty: 'medium',
    timeElapsed: 0,
    mistakesMade: 0,
    hintsUsed: 0,
    isCompleted: false,
    isPaused: false,
    isNotesMode: false,
    selectedCell: null,
    history: [],
    historyIndex: -1,
    isDailyChallenge: false,
    dailyChallengeDate: null,
  };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'NEW_GAME': {
      return {
        ...createInitialState(),
        puzzle: action.puzzle,
        solution: action.solution,
        currentState: deepCopyGrid(action.puzzle),
        difficulty: action.difficulty,
        isDailyChallenge: action.isDailyChallenge || false,
        dailyChallengeDate: action.dailyChallengeDate || null,
      };
    }

    case 'LOAD_GAME': {
      return {
        ...state,
        ...action.gameState,
      };
    }

    case 'SET_VALUE': {
      const { row, col, value } = action;

      if (state.puzzle[row][col] !== 0 || state.isCompleted || state.isPaused) {
        return state;
      }

      const newState = deepCopyGrid(state.currentState);
      const previousValue = newState[row][col];
      newState[row][col] = value;

      const newNotes = new Map(state.notes);
      newNotes.delete(`${row},${col}`);

      const historyEntry: GameHistoryEntry = {
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

      const isComplete = isGridComplete(newState);

      return {
        ...state,
        currentState: newState,
        notes: newNotes,
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

      const newState = deepCopyGrid(state.currentState);
      const previousValue = newState[row][col];

      if (previousValue === 0) {
        return state;
      }

      newState[row][col] = 0;

      const historyEntry: GameHistoryEntry = {
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

    case 'TOGGLE_NOTE': {
      const { row, col, value } = action;

      if (state.puzzle[row][col] !== 0 || state.currentState[row][col] !== 0 || state.isCompleted || state.isPaused) {
        return state;
      }

      const cellKey = `${row},${col}`;
      const newNotes = new Map(state.notes);
      const cellNotes = new Set(newNotes.get(cellKey) || []);
      const previousNotes = new Set(cellNotes);

      if (cellNotes.has(value)) {
        cellNotes.delete(value);
      } else {
        cellNotes.add(value);
      }

      if (cellNotes.size === 0) {
        newNotes.delete(cellKey);
      } else {
        newNotes.set(cellKey, cellNotes);
      }

      const historyEntry: GameHistoryEntry = {
        action: 'setNote',
        row,
        col,
        value,
        previousNotes,
      };

      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(historyEntry);

      return {
        ...state,
        notes: newNotes,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case 'CLEAR_NOTES': {
      const { row, col } = action;
      const cellKey = `${row},${col}`;
      const newNotes = new Map(state.notes);
      const previousNotes = newNotes.get(cellKey);

      if (!previousNotes) {
        return state;
      }

      newNotes.delete(cellKey);

      const historyEntry: GameHistoryEntry = {
        action: 'clearNote',
        row,
        col,
        previousNotes,
      };

      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(historyEntry);

      return {
        ...state,
        notes: newNotes,
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

    case 'TOGGLE_NOTES_MODE': {
      return {
        ...state,
        isNotesMode: !state.isNotesMode,
      };
    }

    case 'USE_HINT': {
      if (state.isCompleted || state.isPaused) {
        return state;
      }

      const hint = getHint(state.puzzle, state.currentState, state.solution);

      if (!hint) {
        return state;
      }

      const newState = deepCopyGrid(state.currentState);
      newState[hint.row][hint.col] = hint.value;

      const newNotes = new Map(state.notes);
      newNotes.delete(`${hint.row},${hint.col}`);

      const historyEntry: GameHistoryEntry = {
        action: 'setValue',
        row: hint.row,
        col: hint.col,
        value: hint.value,
        previousValue: 0,
      };

      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(historyEntry);

      const isComplete = isGridComplete(newState);

      return {
        ...state,
        currentState: newState,
        notes: newNotes,
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
      const newState = deepCopyGrid(state.currentState);
      const newNotes = new Map(state.notes);
      const cellKey = `${entry.row},${entry.col}`;

      if (entry.action === 'setValue') {
        newState[entry.row][entry.col] = entry.previousValue || 0;
      } else if (entry.action === 'clearCell') {
        newState[entry.row][entry.col] = entry.previousValue || 0;
      } else if (entry.action === 'setNote' || entry.action === 'clearNote') {
        if (entry.previousNotes) {
          if (entry.previousNotes.size > 0) {
            newNotes.set(cellKey, new Set(entry.previousNotes));
          } else {
            newNotes.delete(cellKey);
          }
        }
      }

      return {
        ...state,
        currentState: newState,
        notes: newNotes,
        historyIndex: state.historyIndex - 1,
      };
    }

    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1 || state.isCompleted || state.isPaused) {
        return state;
      }

      const entry = state.history[state.historyIndex + 1];
      const newState = deepCopyGrid(state.currentState);
      const newNotes = new Map(state.notes);
      const cellKey = `${entry.row},${entry.col}`;

      if (entry.action === 'setValue') {
        newState[entry.row][entry.col] = entry.value || 0;
        newNotes.delete(cellKey);
      } else if (entry.action === 'clearCell') {
        newState[entry.row][entry.col] = 0;
      } else if (entry.action === 'setNote') {
        const cellNotes = new Set(newNotes.get(cellKey) || []);
        if (entry.value) {
          if (cellNotes.has(entry.value)) {
            cellNotes.delete(entry.value);
          } else {
            cellNotes.add(entry.value);
          }
        }
        if (cellNotes.size > 0) {
          newNotes.set(cellKey, cellNotes);
        } else {
          newNotes.delete(cellKey);
        }
      } else if (entry.action === 'clearNote') {
        newNotes.delete(cellKey);
      }

      return {
        ...state,
        currentState: newState,
        notes: newNotes,
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

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, createInitialState());
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
    return getConflicts(state.currentState, row, col);
  }, [state.currentState]);

  const getCellNotes = useCallback((row: number, col: number): Set<number> => {
    return state.notes.get(`${row},${col}`) || new Set();
  }, [state.notes]);

  return {
    state,
    dispatch,
    getConflictingCells,
    getCellNotes,
  };
}
