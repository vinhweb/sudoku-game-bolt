import React from 'react';
import { Trophy, Clock, Lightbulb, AlertCircle, Home, RotateCcw } from 'lucide-react';

interface GameCompleteProps {
  timeElapsed: number;
  mistakesMade: number;
  hintsUsed: number;
  difficulty: string;
  onNewGame: () => void;
  onMainMenu: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export function GameComplete({
  timeElapsed,
  mistakesMade,
  hintsUsed,
  difficulty,
  onNewGame,
  onMainMenu,
}: GameCompleteProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full space-y-6 animate-slideUp">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="bg-yellow-100 p-4 rounded-full">
              <Trophy className="w-16 h-16 text-yellow-500" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-800">Congratulations!</h2>
          <p className="text-slate-600">You completed the puzzle</p>
        </div>

        <div className="bg-slate-50 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="font-medium">Difficulty:</span>
            </div>
            <span className="text-lg font-semibold text-slate-800 capitalize">{difficulty}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-5 h-5" />
              <span className="font-medium">Time:</span>
            </div>
            <span className="text-lg font-semibold text-slate-800">{formatTime(timeElapsed)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-600">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Mistakes:</span>
            </div>
            <span className="text-lg font-semibold text-red-600">{mistakesMade}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-600">
              <Lightbulb className="w-5 h-5" />
              <span className="font-medium">Hints:</span>
            </div>
            <span className="text-lg font-semibold text-amber-600">{hintsUsed}</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={onNewGame}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg active:scale-98"
          >
            <RotateCcw className="w-5 h-5" />
            <span className="font-semibold">New Game</span>
          </button>

          <button
            onClick={onMainMenu}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all duration-200"
          >
            <Home className="w-5 h-5" />
            <span className="font-semibold">Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
}
