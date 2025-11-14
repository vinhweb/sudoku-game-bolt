import React from 'react';
import {
  Lightbulb,
  Undo2,
  Redo2,
  PenLine,
  Pause,
  Play,
  Timer
} from 'lucide-react';

interface GameControlsProps {
  timeElapsed: number;
  mistakesMade: number;
  hintsUsed: number;
  isPaused: boolean;
  isNotesMode: boolean;
  canUndo: boolean;
  canRedo: boolean;
  isCompleted: boolean;
  onHint: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onToggleNotes: () => void;
  onTogglePause: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function GameControls({
  timeElapsed,
  mistakesMade,
  hintsUsed,
  isPaused,
  isNotesMode,
  canUndo,
  canRedo,
  isCompleted,
  onHint,
  onUndo,
  onRedo,
  onToggleNotes,
  onTogglePause,
}: GameControlsProps) {
  return (
    <div className="w-full max-w-md space-y-4">
      <div className="flex items-center justify-between bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-blue-600" />
          <span className="text-2xl font-bold text-slate-800">{formatTime(timeElapsed)}</span>
        </div>
        <button
          onClick={onTogglePause}
          disabled={isCompleted}
          className={`
            p-2 rounded-lg transition-all duration-200
            ${
              isCompleted
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200 active:scale-95'
            }
          `}
        >
          {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 bg-white rounded-lg shadow-md p-3 text-center">
          <div className="text-sm text-slate-600">Mistakes</div>
          <div className="text-xl font-bold text-red-600">{mistakesMade}</div>
        </div>
        <div className="flex-1 bg-white rounded-lg shadow-md p-3 text-center">
          <div className="text-sm text-slate-600">Hints</div>
          <div className="text-xl font-bold text-amber-600">{hintsUsed}</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={onUndo}
          disabled={!canUndo || isPaused || isCompleted}
          className={`
            flex flex-col items-center justify-center gap-1 p-3 rounded-lg
            transition-all duration-200
            ${
              !canUndo || isPaused || isCompleted
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-white text-slate-700 hover:bg-slate-50 active:scale-95 shadow-md'
            }
          `}
        >
          <Undo2 className="w-5 h-5" />
          <span className="text-xs">Undo</span>
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo || isPaused || isCompleted}
          className={`
            flex flex-col items-center justify-center gap-1 p-3 rounded-lg
            transition-all duration-200
            ${
              !canRedo || isPaused || isCompleted
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-white text-slate-700 hover:bg-slate-50 active:scale-95 shadow-md'
            }
          `}
        >
          <Redo2 className="w-5 h-5" />
          <span className="text-xs">Redo</span>
        </button>

        <button
          onClick={onToggleNotes}
          disabled={isPaused || isCompleted}
          className={`
            flex flex-col items-center justify-center gap-1 p-3 rounded-lg
            transition-all duration-200
            ${
              isPaused || isCompleted
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : isNotesMode
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-50 active:scale-95 shadow-md'
            }
          `}
        >
          <PenLine className="w-5 h-5" />
          <span className="text-xs">Notes</span>
        </button>

        <button
          onClick={onHint}
          disabled={isPaused || isCompleted}
          className={`
            flex flex-col items-center justify-center gap-1 p-3 rounded-lg
            transition-all duration-200
            ${
              isPaused || isCompleted
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
  );
}
